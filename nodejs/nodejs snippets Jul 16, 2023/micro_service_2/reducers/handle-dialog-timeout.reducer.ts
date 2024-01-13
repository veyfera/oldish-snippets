import to from 'await-to-js';
import { Injectable, Inject } from 'injection-js';
import { Logger } from 'winston';

import { AmqpClient } from '../../../clients/amqp.client';
import { MessengerClient } from '../../../clients/messenger.client';
import { TodoBackendClient } from '../../../clients/todo-backend.client';
import { Reducer } from '../../../core/reducer';
import { Store } from '../../../core/store/store';
import { addBotCustomization } from '../../../helpers/slack';
import { DeprecatedMessengerMessage } from '../../../types/messenger-types';
import { ReportQuestion } from '../../../types/report-types';
import { MessengerType } from '../../../types/report-types/messenger-type';
import { RespondentDialogAnswer } from '../../../types/respondent-dialog-types';
import { HANDLE_DIALOG_TIMEOUT, CLOSE_DIALOG_SESSION } from '../action-types';
import { RespondentDialogDoc } from '../db/respondent-dialogs/respondent-dialog.doc';
import { RespondentDialogsCollection } from '../db/respondent-dialogs/respondent-dialogs.collection';
import { addAnswersButton } from '../slack-controls/buttons/add-answers.button';

@Injectable()
export class HandleDialogTimeoutReducer extends Reducer {
    constructor(
        @Inject('STORE') protected store: Store,
        @Inject('LOGGER') protected logger: Logger,
        protected respondentDialogsCollection: RespondentDialogsCollection,
        protected amqpClient: AmqpClient,
        protected messengerClient: MessengerClient,
        protected todoBackendClient: TodoBackendClient,
    ) {
        super(HANDLE_DIALOG_TIMEOUT);
        this.subscribeToStore();
    }

    protected async reduce(data: string): Promise<boolean> {
        const dialog = await this.respondentDialogsCollection.findById(data);

        if (!dialog) {
            this.logger.error('Failed to find document', { id: data });
            return false;
        }

        if (!dialog.dialog) {
            this.logger.error('Failed to get dialog property from document', { document: dialog });
            return false;
        }

        this.logger.info('Send timeout message', dialog.dialog.correlationId);

        const query = { '_id': dialog._id, 'session.answerType': 'normal' };
        const modifier = { $set: { 'session.answerType': 'timed-out' } };

        const { modifiedCount } = await this.respondentDialogsCollection.updateOne(query, modifier);

        if (modifiedCount === 0) {
            this.logger.error(
                'Can\'t update answerType, since it\'s not "normal" or doc removed',
                {
                    ...dialog.dialog.correlationId,
                    query,
                    modifier
                }
            );

            return false;
        }

        if (dialog.dialog.sendResults) {
            const reportDocId: string | null = dialog.dialog!.reportDocId;

            if (reportDocId) {
                const params = { userId: dialog.dialog!.respondent.id, teamId: dialog.dialog!.respondent!.teamId, reportId: dialog.dialog!.correlationId!.reportId };
                const todoIntegration = await this.todoBackendClient.getReportIntegration(params);
                console.log('todo integration for expired report: ', todoIntegration)
                let timeoutMessageText = 'Aw, you\'re out of time. I\'m wrapping up the report without your answers 😕';

                if (todoIntegration) {
                    const successfullyAddedAnswers = await this.addTodoAnswers(todoIntegration, dialog);

                    if (successfullyAddedAnswers) {
                        timeoutMessageText = 'Hey, I’ve just submitted the answers instead of you based on your TODO lists, so don’t worry that you missed the survey. If I made a mistake somewhere, just edit the answers.';
                    }
                }

                const messengerInteractiveMessage: DeprecatedMessengerMessage = {
                    messengerType: dialog.dialog.messengerType,
                    to: dialog.dialog.respondent,
                    text: timeoutMessageText,
                    type: 'sendTimeoutMessage',
                    attachments: [
                        {
                            callbackId: reportDocId,
                            fallback: '',
                            actions: []
                        }
                    ],
                };

                if (dialog.dialog.controls.addAnswers && !todoIntegration) {
                    messengerInteractiveMessage.attachments![0]!.actions!.push(addAnswersButton());
                }

                addBotCustomization(dialog.dialog.messengerType, messengerInteractiveMessage, dialog.dialog.botInfo);

                const [msgError, ctx] = await to(this.messengerClient.postMessage(messengerInteractiveMessage));

                if (msgError) {
                    this.logger.error('Failed to sent timeout message via BotGateway', {
                        error: msgError,
                        message: messengerInteractiveMessage,
                        ...dialog.dialog.correlationId
                    });
                }

                if (!ctx) {
                    this.logger.error('Failed to get context of timeout message', {
                        context: ctx,
                        ...dialog.dialog.correlationId
                    });
                }
            } else {
                this.logger.error(`reportDocId not found at SEND_TIMEOUT_MESSAGE. ReportType: ${dialog.dialog.reportType}`, {
                    ...dialog.dialog.correlationId,
                    dialog
                });
            }
        }

        await this.store.emit({
            actionType: CLOSE_DIALOG_SESSION,
            data: dialog._id!.toString()
        });

        return true;
    }

    private async addTodoAnswers(questionsWithTodoIntegration: Array<string>, dialog: RespondentDialogDoc): Promise<boolean> {
        switch (dialog!.dialog!.messengerType) {
            case MessengerType.Slack:
                this.logger.info('Start adding todo answers to expired report', { ...dialog!.dialog!.correlationId });
                console.log('Start adding todo answers to expired report');

                let step = dialog.getCurrentStep();
                // get rid of answered quesions and questions that don't need to be answered
                const currentQuestion = dialog.getCurrentQuestion();
                const answers: Array<RespondentDialogAnswer> = [];

                if (questionsWithTodoIntegration.includes(currentQuestion.id)) {
                    // we already have the answer in bot db
                    let answerText = currentQuestion.todo!;

                    answers.push(this.answerDoc(answerText, currentQuestion, dialog));
                    step ++;
                }

                const questions = dialog.getQuestions().slice(step).filter(q => q.type !== 'say');

                for (const q of questions) {
                    console.log('question ', q, 'gettinganswers')
                    let answerText = '';

                    if (questionsWithTodoIntegration.includes(q.id)){
                        answerText = await this.getAnswerFromTodoDb(dialog, q.id);
                    }

                    answers.push(this.answerDoc(answerText, q, dialog));
                }

                if (answers.every(a => a.answer === '')) {
                    // did not add any answers
                    return false;
                } else {
                    await this.saveAnswers(answers, dialog);
                    return true;
                }
                break;
            case MessengerType.MicrosoftTeams:
                break;
            default:
                break;

        }

        return true;
    }

    private async getAnswerFromTodoDb(dialog: RespondentDialogDoc, questionId: string): Promise<string> {
        console.log('start getting answer');
        const params = {
            userId: dialog.dialog!.respondent.id,
            teamId: dialog.dialog!.respondent!.teamId,
            reportId: dialog.dialog!.correlationId!.reportId,
            questionId 
        };
        const todoData = await this.todoBackendClient.getTodoAnswer(params);

        if (todoData) {
            console.log('finish getting answers, succes');
            return todoData.todo;
        }

        console.log('finish getting answers, failure');
        return '-';
    }
 
    private answerDoc(answerText: string, question: ReportQuestion, dialog: RespondentDialogDoc): RespondentDialogAnswer {
        const answer: RespondentDialogAnswer = {
            questionId: question.id,
            question: question.question,
            type: question.type,
            isAnonymous: false,
            disableChart: false,
            answer: answerText,
            fileAnswers: [],
            integrationAnswers: [],
            answerId: undefined,
            answeredAt: new Date(),
            messengerCtx: {
                channel: dialog.session!.welcomeMessageCtx!.channel,
                ts: '',
                slackEntityId: dialog.dialog!.correlationId!.userId,
                activityId: undefined,
                userId: dialog.dialog!.correlationId!.userId,
                replyToId: undefined,
                conversation: undefined,
            },
            includeInSummary: false,
        };

        return answer;
    }

    private async saveAnswers(newAnswers: Array<RespondentDialogAnswer>, dialog: RespondentDialogDoc): Promise<boolean> {
        console.log('started saving answers to db', newAnswers);
        const { modifiedCount } = await this.respondentDialogsCollection.updateOne(
            { _id: dialog._id },
            { $push: { 'session.answerData': { $each: newAnswers } } }
        );

        if (modifiedCount === 0) {
            this.logger.error(
                'Can\'t add todo answers to expired report',
                {
                    ...dialog!.dialog!.correlationId,
                    newAnswers
                }
            );

            return false;
        }

        console.log('finished saving answers to db');
        return true;
    }
}
