import to from 'await-to-js';
import { Inject, Injectable } from 'injection-js';
import * as momentTz from 'moment-timezone';
import { Logger } from 'winston';

import { Block, MessengerMessage } from '../../../../../libs/typescript/types/messengers/messenger-message';
import { AmqpClient } from '../../../clients/amqp.client';
import { MessengerClient } from '../../../clients/messenger.client';
import { StatsDClient } from '../../../clients/statsd.client';
import { TodoBackendClient, TODO_COLOR } from '../../../clients/todo-backend.client';
import { Reducer } from '../../../core/reducer';
import { Store } from '../../../core/store/store';
import { get } from '../../../helpers/get';
import { allowValuesTooLong, taskValuesTooLong } from '../../../helpers/report';
import { addBotCustomization, isChannelId, isGroupId, isUserId } from '../../../helpers/slack';
import { getLetter } from '../../../helpers/strings';
import { dataRequestsTx } from '../../../schemas/amqp/exchanges/data-requests-tx.exchange';
import { MessageContext } from '../../../types/internal-types/message-context';
import { DeprecatedMessengerMessage } from '../../../types/messenger-types';
import { QuestionType, ReportQuestion } from '../../../types/report-types';
import { MessengerType } from '../../../types/report-types/messenger-type';
import { Respondent } from '../../../types/report-types/report-respondent';
import { RespondentDialog } from '../../../types/respondent-dialog-types';
import { GET_NEXT_QUESTION, SEND_QUESTION } from '../action-types';
import { RespondentDialogDoc } from '../db/respondent-dialogs/respondent-dialog.doc';
import { RespondentDialogsCollection } from '../db/respondent-dialogs/respondent-dialogs.collection';
import { reportNowButton } from '../messenger-controls/buttons/report-now.button';
import { SendQuestionData } from '../types/reducers-data';

@Injectable()
export class SendQuestionReducer extends Reducer {
    constructor(
        @Inject('LOGGER') protected logger: Logger,
        @Inject('STORE') protected store: Store,
        protected respondentDialogsCollection: RespondentDialogsCollection,
        protected amqpClient: AmqpClient,
        protected messengerClient: MessengerClient,
        protected todoBackendClient: TodoBackendClient,
        private statsD: StatsDClient,
    ) {
        super(SEND_QUESTION);
        this.subscribeToStore();
    }

    protected async reduce(data: SendQuestionData): Promise<boolean> {
        const dialog = await this.respondentDialogsCollection.findById(data.dialogId);

        if (!dialog || !dialog.dialog) {
            this.logger.error('Could not find dialog', {
                ...data,
                action: SEND_QUESTION
            });

            return false;
        }

        this.logger.info('Send question', {
            question: data.question,
            ...dialog.dialog.correlationId
        });

        const externalMessage: DeprecatedMessengerMessage = {
            messengerType: dialog.dialog!.messengerType,
            type: 'sendQuestion',
            to: {
                id: dialog.dialog!.respondent.id,
                teamId: dialog.dialog!.respondent.teamId,
                name: dialog.dialog!.respondent.name,
            },
            text: (data.question.conditions && data.question.conditions.isAnonymous)
                ? '*[Anonymous]* ' + data.question.question
                : data.question.question,
            attachments: [],
        };

        const shouldSendRequestWithTheFirstQuestion =
            dialog.isFirstQuestion()
            && dialog.dialog.sendRequestsWithTheFirstQuestion;
        const params = {
            userId: dialog.dialog!.respondent.id,
            teamId: dialog.dialog!.respondent!.teamId,
            reportId: dialog.dialog!.correlationId!.reportId,
            questionId: data.question.id
        };
        const hasTodoIntegration = data.question.type === 'say' ? false : await this.todoBackendClient.getTodoAnswer(params);

        if (shouldSendRequestWithTheFirstQuestion) {
            const reportDocId: string | null = dialog.dialog.reportDocId;

            if (reportDocId) {
                await this.sendRequests(reportDocId, dialog.dialog);
            } else {
                this.logger.error(`reportDocId not found at SEND_QUESTION for getRequestsAttachments. ReportType: ${dialog.dialog.reportType}`, {
                    ...dialog.dialog.correlationId,
                    dialog
                });
            }
        }

        if (get(data.question, q => q.conditions!.sendPreviousAnswer, false)) {
            this.addPreviousAnswer(externalMessage, data.question, dialog.dialog!.respondent);
        }

        if (hasTodoIntegration) {
            await this.addTodoAttachment(externalMessage, hasTodoIntegration, data.question.id, dialog._id);
        }

        if (data.question.partialAnswer) {
            this.addPartialAnswer(externalMessage, data.question, dialog.dialog!.respondent);
        }

        const respondentHasPartialAnswer = SendQuestionReducer.respondentHasPartialAnswer(data.question.partialAnswer, dialog.dialog!.respondent.id);

        if (data.question.type === QuestionType.survey && !respondentHasPartialAnswer) {
            this.addSurvey(externalMessage, dialog._id!.toString(), data.question);
        } else if (data.question.type === QuestionType.trelloTask) {
            this.addTrelloTask(externalMessage, dialog._id!.toString(), data.question);
        }

        if (dialog.dialog!.controls.continueReport) {
            const reportDocId: string | null = dialog.dialog.reportDocId;

            if (reportDocId) {
                externalMessage.attachments!.push({
                    text: '',
                    callbackId: reportDocId,
                    fallback: '',
                    actions: [reportNowButton()]
                });
            } else {
                this.logger.error(`reportDocId not found at SEND_QUESTION for push attachments. ReportType: ${dialog.dialog.reportType}`, {
                    ...dialog.dialog.correlationId,
                    dialog
                });
            }
        }

        await this.respondentDialogsCollection.updateOne(
            { _id: dialog._id },
            { $set: { 'session.muteAnswers': false } }
        );

        if (dialog.dialog!.messengerType === MessengerType.Slack) {
            addBotCustomization(dialog.dialog!.messengerType, externalMessage, dialog.dialog!.botInfo);
        }

        this.logger.info('Send question with postMessage method', { externalMessage, dialog });

        await to<MessageContext>(this.messengerClient.postMessage(externalMessage));

        this.trackResponseTime(dialog);

        const shouldEmitNextQuestion = data.question.type === QuestionType.say || (data.question.type === QuestionType.survey && respondentHasPartialAnswer);

        if (shouldEmitNextQuestion) {
            await this.store.emit({
                actionType: GET_NEXT_QUESTION,
                data: dialog._id!.toString()
            });
        }

        this.logger.info('Send question finished', {
            sentMessage: externalMessage,
            ...dialog.dialog.correlationId
        });

        return true;
    }

    private static respondentHasPartialAnswer(partialAnswer: any, respondentId: string): boolean {
        if (!partialAnswer) {
            return false;
        }

        return !!partialAnswer[respondentId] && !!partialAnswer[respondentId].answerId;
    }

    private addPreviousAnswer(externalMessage: DeprecatedMessengerMessage, question: ReportQuestion, respondent: Respondent): void {
        const previousAnswer = get(question, q => q.previousAnswer![respondent.id]);

        const previousText = !!previousAnswer
            ? previousAnswer.answer
            : 'No answer';

        const previousDate = !!previousAnswer
            ? momentTz.tz(previousAnswer.date, respondent.tz || 'America/Los_Angeles')
            : undefined;

        const title = !!previousDate && previousDate.isValid()
            ? `Your previous answer from ${previousDate.format('YYYY-MM-DD')}`
            : 'Your previous answer';

        externalMessage.attachments!.push({
            fallback: `${title}: ${previousText}`,
            title,
            text: `💬 _${previousText}_`,
            mrkdwnIn: ['text']
        });
    }

    private addPartialAnswer(externalMessage: DeprecatedMessengerMessage, question: ReportQuestion, respondent: Respondent): void {
        const partialAnswer = get(question, q => q.partialAnswer![respondent.id]);

        if (partialAnswer && partialAnswer.answer) {
            externalMessage.attachments!.push({
                fallback: `*Your partial answer ${partialAnswer.answer}`,
                title: 'Your partial answer',
                text: `${partialAnswer.answer}`,
                mrkdwnIn: ['text'],
            });
        }
    }

    private addSurvey(externalMessage: DeprecatedMessengerMessage, dialogId: string, question: ReportQuestion): void {
        const tooLong = allowValuesTooLong(question);

        if (tooLong) {
            const formatOption = (val: string, i: number) =>
                `*${getLetter(i)}.* ${val}`;

            externalMessage.text += '\n\n'
                + question.allowValues!.map(formatOption).join('\n');
        }

        const blocks = this.splitLongTextToBlocks(externalMessage);

        // if slackMessage.text exists, but differ than slackMessage.blocks.text - Slack shows two messages
        delete externalMessage.text;

        if (!externalMessage.blocks) {
            externalMessage.blocks = [];
        }

        externalMessage.blocks!.push(...blocks);

        switch (externalMessage.messengerType) {
            case MessengerType.Slack:
                let questionType: string = 'static_select';

                if (question.multiselect) {
                    questionType = 'multi_static_select';
                }

                if (externalMessage.blocks![0]) {
                    (externalMessage.blocks as any)![0].accessory = {
                        type: questionType,
                        placeholder: {
                            type: 'plain_text',
                            text: 'Select items',
                            emoji: true
                        },
                        options: question.allowValues!.map((value, i) => ({
                            text: {
                                type: 'plain_text',
                                text: tooLong ? getLetter(i) : value,
                                emoji: true
                            },
                            value: i.toString()
                        }))
                    };

                    if (question.multiselect) {
                        (externalMessage.blocks as any)![0].accessory.max_selected_items = question.allowValues!.length;
                    }
                }
                break;
            case MessengerType.MicrosoftTeams:
                if (externalMessage.blocks![0]) {
                    const options = question.allowValues!.map((value, i) => ({
                        title: tooLong ? getLetter(i) : value,
                        value: i.toString()
                    }));

                    externalMessage.blocks!.push({
                        type: 'ColumnSet',
                        columns: [
                            {
                                type: 'Column',
                                width: 'stretch',
                                items: [
                                    {
                                        type: 'Input.ChoiceSet',
                                        choices: options,
                                        placeholder: 'Select items',
                                        id: 'question_select',
                                        isMultiSelect: question.multiselect,
                                    }
                                ]
                            },
                            {
                                type: 'Column',
                                width: 'stretch',
                                items: [
                                    {
                                        type: 'ActionSet',
                                        actions: [
                                            {
                                                type: 'Action.Submit',
                                                title: 'Send answer',
                                                id: 'send_question_select',
                                                data: {
                                                    actionType: 'question_select',
                                                    isMultiSelect: question.multiselect,
                                                    callbackId: `${dialogId} ${question.id}`,
                                                    originalMessage: {
                                                        messengerType: 'microsoft-teams',
                                                        type: 'sendQuestion',
                                                        to: {
                                                            teamId: externalMessage.to!.teamId,
                                                            id: externalMessage.to!.id,
                                                            name: externalMessage.to!.name,
                                                        },
                                                        text: question.question,
                                                    },
                                                }
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    });
                }
                break;
            default:
                break;
        }

        externalMessage.attachments!.push({
            text: '',
            callbackId: `${dialogId} ${question.id}`,
            fallback: '',
        });
    }

    private addTrelloTask(externalMessage: DeprecatedMessengerMessage, dialogId: string, question: ReportQuestion): void {
        const tooLong = taskValuesTooLong(question);

        if (tooLong) {
            const formatOption = (val: string, i: number) =>
                `*${getLetter(i)}.* ${val}`;

            const titles: Array<string> = [];

            for (const taskValue of question.taskValues!) {
                titles.push(taskValue.title);
            }

            externalMessage.text += '\n\n'
                + titles.map(formatOption).join('\n');
        }

        const blocks = this.splitLongTextToBlocks(externalMessage);

        // if slackMessage.text exists, but differ than slackMessage.blocks.text - Slack shows two messages
        delete externalMessage.text;

        if (!externalMessage.blocks) {
            externalMessage.blocks = [];
        }

        externalMessage.blocks!.push(...blocks);

        switch (externalMessage.messengerType) {
            case MessengerType.Slack:
                if (externalMessage.blocks![0]) {
                    (externalMessage.blocks as any)![0].accessory = {
                        type: 'multi_static_select',
                        placeholder: {
                            type: 'plain_text',
                            text: 'Select items',
                            emoji: true
                        },
                        max_selected_items: question.taskValues!.length,
                        options: question.taskValues!.map((value, i) => ({
                            text: {
                                type: 'plain_text',
                                text: tooLong ? getLetter(i) : value.title,
                                emoji: true
                            },
                            value: value.id
                        }))
                    };
                }

                externalMessage.attachments!.push({
                    text: '',
                    callbackId: `${dialogId} ${question.id}`,
                    fallback: '',
                });
                break;
            case MessengerType.MicrosoftTeams:
                if (externalMessage.blocks![0]) {
                    externalMessage.blocks!.push({
                        type: 'ColumnSet',
                        columns: [
                            {
                                type: 'Column',
                                width: 'stretch',
                                items: [
                                    {
                                        type: 'Input.ChoiceSet',
                                        choices: question.taskValues!.map((value, i) => ({
                                            title: tooLong ? getLetter(i) : value.title,
                                            value: value.id
                                        })),
                                        placeholder: 'Select items',
                                        id: 'question_select',
                                        isMultiSelect: true,
                                    }
                                ]
                            },
                            {
                                type: 'Column',
                                width: 'stretch',
                                items: [
                                    {
                                        type: 'ActionSet',
                                        actions: [
                                            {
                                                type: 'Action.Submit',
                                                title: 'Send answer',
                                                id: 'send_question_select',
                                                data: {
                                                    actionType: 'question_select',
                                                    isMultiSelect: true,
                                                    callbackId: `${dialogId} ${question.id}`,
                                                    originalMessage: {
                                                        messengerType: 'microsoft-teams',
                                                        type: 'sendQuestion',
                                                        to: {
                                                            teamId: externalMessage.to!.teamId,
                                                            id: externalMessage.to!.id,
                                                            name: externalMessage.to!.name,
                                                        },
                                                        text: question.question,
                                                    },
                                                }
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    });
                }

                externalMessage.attachments!.push({
                    text: '',
                    callbackId: `${dialogId} ${question.id}`,
                });
                break;
            default:
                break;
        }
    }

    private async addTodoAttachment(externalMessage: DeprecatedMessengerMessage, integrationData: any, questionId: string, dialogId: string): Promise<void> {
        switch (externalMessage.messengerType) {
            case MessengerType.Slack:
                const integrationDataEmpty = integrationData.todo === '';

                if (integrationDataEmpty) {
                    externalMessage.attachments!.push({ text: `I could not find any ${integrationData.status} TODO in your list for ${integrationData.listName}.` });
                } else {
                    externalMessage.attachments = externalMessage.attachments!.concat([
                        {
                            color: `#${TODO_COLOR}`,
                            text: `I found the following in your ${integrationData.status} TODO list for ${integrationData.listName}. Send me the comments if you’d like to add something or just click “Submit” to use this data.`,
                            callbackId: dialogId,
                            fallback: '',
                            actions: [{
                                    name: 'change_tasks',
                                    text: 'Change tasks',
                                    type: 'button',
                                    value: 'change_tasks'
                                }
                                ,{
                                name: 'submit_todo',
                                text: 'Submit',
                                type: 'button',
                                style: 'primary',
                                value: 'submit_todo'
                            }],
                        },
                        { text: integrationData.todo, color: `#${TODO_COLOR}` }
                    ]);
                }

                // save todo to db, for later use in receive-answer.reducer, submit-todo-action.reducer and handle-dialog-timeout.reducer
                await this.respondentDialogsCollection.updateOne(
                    { _id: dialogId, "dialog.questions.id": questionId },
                    { $set: { 'dialog.questions.$.todo': integrationData.todo} }
                );
                break;
            case MessengerType.MicrosoftTeams:
                break;
        }    
    }

    private splitLongTextToBlocks(externalMessage: DeprecatedMessengerMessage): Array<object> {
        const slicedText: Array<string> = [];
        const originalText = externalMessage.text ?? '';
        let lastPart = originalText;

        const MAX_LENGTH = 2500;
        if (originalText.length > MAX_LENGTH) {
            const lines = originalText.split('\n');
            if (lines.find(l => l.length > MAX_LENGTH)) {
                // break without lines
                let pos = 0;
                while ((pos + MAX_LENGTH) < originalText.length) {
                    slicedText.push(originalText.substring(pos, pos + MAX_LENGTH));
                    pos += MAX_LENGTH;
                }

                lastPart = originalText.substring(pos);
            } else {
                // break by lines
                let textPart = '';
                while (lines.length > 0) {
                    const line = lines.shift() ?? '';

                    if (textPart.length + line.length > MAX_LENGTH) {
                        slicedText.push(textPart);
                        textPart = '';
                    }

                    textPart += (textPart.length ? '\n' : '') + line;
                }

                lastPart = textPart;
            }
        }

        const blocks: Array<object> = [];

        switch (externalMessage.messengerType) {
            case MessengerType.Slack:
                if (slicedText.length > 0) {
                    blocks.push(
                        ...slicedText.map(text => ({
                                'type': 'section',
                                'text': {
                                    'type': 'mrkdwn',
                                    text
                                },
                            })
                        )
                    );
                }

                blocks.push({
                        'type': 'section',
                        'text': {
                            'type': 'mrkdwn',
                            text: lastPart
                        },
                    }
                );

                return blocks;
            case MessengerType.MicrosoftTeams:
                if (slicedText.length > 0) {
                    blocks.push(
                        ...slicedText.map(text => ({
                                type: 'RichTextBlock',
                                inlines: [
                                    {
                                        type: 'TextRun',
                                        text,
                                    }
                                ]
                            })
                        )
                    );
                }

                blocks.push({
                    type: 'RichTextBlock',
                    inlines: [
                        {
                            type: 'TextRun',
                            text: lastPart,
                        }
                    ]
                });

                return blocks;
            default:
                return blocks;
        }
    }

    private async getRequestsBlocks(reportDocId: string): Promise<Array<Block>> {
        return await this.amqpClient.request<Array<Block>>(dataRequestsTx.exchange, 'get_request_result', { reportId: reportDocId });
    }

    // Measure time between last answer and next question to assess bot performance
    private trackResponseTime(dialogDoc: RespondentDialogDoc) {
        try {
            const answerData = dialogDoc.session?.answerData;

            if (!Array.isArray(answerData)) {
                return;
            }

            if (answerData.length == 0) {
                return;
            }

            const lastAnswer = answerData[answerData.length - 1];
            if (!lastAnswer.answeredAt) {
                return;
            }

            const diff = Date.now() - lastAnswer.answeredAt.getTime();
            this.statsD.timing('bot.response_time', diff);
            if (diff > 5000) {
                this.logger.warn('Response time is too long', {
                    ...dialogDoc.dialog?.correlationId,
                    diff
                });
            }
        } catch (e) {
            this.logger.error('Error while measuring response time', e);
        }
    }

    private async sendRequests(reportDocId: string, dialog: RespondentDialog): Promise<void> {
        const requestsBlocks: Array<Block> = await this.getRequestsBlocks(reportDocId);

        if (
            Array.isArray(requestsBlocks)
            && requestsBlocks.length > 0
        ) {
            const messengerMessage: MessengerMessage = {
                messengerType: dialog.messengerType,
                delivery: {
                    team: {
                        id: dialog.respondent.teamId,
                        name: '',
                    }
                },
                message: {
                    blocks: requestsBlocks,
                    context: {},
                }
            };

            if (isUserId(dialog.respondent.id)) {
                messengerMessage.delivery.user = {
                    id: dialog.respondent.id,
                    name: dialog.respondent.name,
                };
            }

            if (
                isChannelId(dialog.respondent.id) ||
                isGroupId(dialog.respondent.id)
            ) {
                messengerMessage.delivery.channel = {
                    id: dialog.respondent.id,
                    name: dialog.respondent.name,
                };
            }

            this.logger.info('Send request with sendMessage method', { messengerMessage, reportDocId, dialog });

            await this.messengerClient.sendMessage(messengerMessage);
        }
    }
}
