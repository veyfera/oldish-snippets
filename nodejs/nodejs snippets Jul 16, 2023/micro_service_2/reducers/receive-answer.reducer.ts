import { Inject, Injectable } from 'injection-js';
import { NodeHtmlMarkdown } from 'node-html-markdown';
import * as sanitizeHtml from 'sanitize-html';
import { Logger } from 'winston';

import { AmqpClient } from '../../../clients/amqp.client';
import { MessengerClient } from '../../../clients/messenger.client';
import { Reducer } from '../../../core/reducer';
import { Store } from '../../../core/store/store';
import { unescapeMessengerServiceCharacters } from '../../../helpers/messenger';
import { PreventSimultaneity } from '../../../helpers/simultaneity';
import { InternalMessage } from '../../../types/internal-types/internal-message';
import { QuestionType } from '../../../types/report-types';
import { MessengerType } from '../../../types/report-types/messenger-type';
import { FileAnswer } from '../../../types/respondent-dialog-types';
import { RECEIVE_ANSWER, RECEIVE_BOT_INTEGRATION_ANSWER, SAVE_ANSWER, VALIDATE_ANSWER } from '../action-types';
import { RespondentDialogsCollection } from '../db/respondent-dialogs/respondent-dialogs.collection';
import { SendMessageFromMicrosoftTeamsProducer } from '../producers/send-message-from-microsoft-teams.producer';
import { SendMessageFromSlackProducer } from '../producers/send-message-from-slack.producer';
import {
    ReceiveAnswerData,
    ReceiveBotIntegrationAnswerData,
    SaveAnswerData,
    ValidateAnswerData
} from '../types/reducers-data';

@Injectable()
export class ReceiveAnswerReducer extends Reducer {
    constructor(
        @Inject('STORE') protected store: Store,
        @Inject('LOGGER') protected logger: Logger,
        protected respondentDialogsCollection: RespondentDialogsCollection,
        protected amqpClient: AmqpClient,
        protected messengerClient: MessengerClient,
        protected sendMessageFromSlackProducer: SendMessageFromSlackProducer,
        protected sendMessageFromMicrosoftTeamsProducer: SendMessageFromMicrosoftTeamsProducer,
    ) {
        super(RECEIVE_ANSWER);
        this.subscribeToStore();
    }

    // #TODO reduce :cyclomatic-complexity
    /* tslint:disable:cyclomatic-complexity */
    @PreventSimultaneity(['slackMessage.user', 'microsoftTeamsMessage.from.id'])
    protected async reduce({ slackMessage, microsoftTeamsMessage }: ReceiveAnswerData): Promise<boolean> {
        let dialog;

        if (slackMessage) {
            try {
                dialog = await this.respondentDialogsCollection.getDialogSlack(this.respondentDialogsCollection, {
                    userId: slackMessage.user,
                    teamId: slackMessage.team
                });
            } catch (err) {
                this.logger.error('getDialogSlack method error', { error: err, slackMessage });
            }

            if (!dialog || !dialog.dialog || dialog.session!.muteAnswers) {
                this.logger.warn('Message without dialog', {
                    userId: slackMessage.user,
                    teamId: slackMessage.team,
                    slackMessage,
                    dialog
                });

                const slackMessageToExpertsBot = {
                    userId: slackMessage.user,
                    teamId: slackMessage.team,
                    channelId: slackMessage.channel,
                    threadId: slackMessage.threadTs,
                    text: slackMessage.text,
                };

                await this.sendMessageFromSlackProducer.publish(slackMessageToExpertsBot);

                return true;
            }
        }

        if (microsoftTeamsMessage) {
            const corrId = {
                userId: microsoftTeamsMessage.from.id,
            };

            try {
                dialog = await this.respondentDialogsCollection.getDialogMicrosoftTeams(this.respondentDialogsCollection, {
                    userId: microsoftTeamsMessage.from.id,
                });
            } catch (err) {
                this.logger.error('getDialogMicrosoftTeams method error', { ...corrId, error: err, microsoftTeamsMessage });
            }

            if (!dialog || !dialog.dialog || dialog.session!.muteAnswers) {
                this.logger.warn('Message without dialog', {
                    ...corrId,
                    microsoftTeamsMessage,
                    dialog,
                });

                const microsoftTeamsMessageToExpertsBot = {
                    userId: microsoftTeamsMessage.from.id,
                    text: microsoftTeamsMessage.text,
                };

                await this.sendMessageFromMicrosoftTeamsProducer.publish(microsoftTeamsMessageToExpertsBot);

                return true;
            }
        }

        await this.respondentDialogsCollection.updateOne(
            { _id: dialog._id },
            { $set: { 'session.muteAnswers': true } }
        );

        switch (dialog!.dialog!.messengerType) {
            case MessengerType.Slack:
                this.logger.info('Receive answer', { ...dialog.dialog.correlationId, answer: slackMessage });

                const messageIsSentByBotIntegrationSlack = Boolean(slackMessage!.botId) && Boolean(slackMessage!.botProfile);

                if (messageIsSentByBotIntegrationSlack) {
                    await this.store.emit<ReceiveBotIntegrationAnswerData>({
                        actionType: RECEIVE_BOT_INTEGRATION_ANSWER,
                        data: {
                            slackMessage: slackMessage!
                        }
                    });

                    return true;
                }

                // If there's a message attached to uploaded files, then it is sent here with corresponding file-subtypes
                const messageHasAttachedFiles: boolean = ((slackMessage as InternalMessage)!.subType === 'file_share' || (slackMessage as InternalMessage)!.subType === 'file_mention');

                const question = dialog.getCurrentQuestion();
                const questionHasTodoIntegration = question?.todo;

                if (
                    messageHasAttachedFiles &&
                    question.type === QuestionType.text
                ) {
                    /* if that evaluates to true then this "message" event is a part of
                    a file-related event (file_shared, file_created etc.), handled by receive-file-asnwer.reducer
                    We should just save it to the DB and let file-reducer emit the next question
                    */
                    if (!!slackMessage!.text) {
                        await this.store.emit<SaveAnswerData>({
                            actionType: SAVE_ANSWER,
                            data: {
                                dialogId: dialog._id!.toString(),
                                answer: slackMessage!.text,
                                channel: slackMessage!.channel,
                                ts: slackMessage!.ts,
                                respondentId: slackMessage!.user,
                                emitNextQuestion: false
                            }
                        });
                    }
                } else {
                    if (questionHasTodoIntegration) {
                        slackMessage!.text = `${slackMessage!.text}\n${question.todo}`;
                    }

                    await this.store.emit<ValidateAnswerData>({
                        actionType: VALIDATE_ANSWER,
                        data: {
                            dialogId: dialog._id!.toString(),
                            answer: slackMessage!.text,
                            channel: slackMessage!.channel,
                            user: slackMessage!.user,
                            ts: slackMessage!.ts,
                            emitNextQuestion: true
                        }
                    });
                }
                break;
            case MessengerType.MicrosoftTeams:
                this.logger.info('Receive answer', { ...dialog.dialog.correlationId, answer: microsoftTeamsMessage });

                const fileAnswers: Array<FileAnswer> = [];
                let needToParseEmoji: boolean = false;
                microsoftTeamsMessage!.attachments
                    ?.filter(attachment => attachment.contentType === 'image/*')
                    .forEach(attachment => {
                        if (attachment.contentUrl!.includes('personal-expressions')) {
                            needToParseEmoji = true;
                        } else {
                            fileAnswers.push({
                                type: attachment.contentType,
                                url: attachment.contentUrl!,
                                name: attachment.name!,
                            });
                        }
                    });

                let answer: string;

                if (needToParseEmoji) {
                    // If user used emoji in answer we need to work with text/html attachment
                    // instead of microsoftTeamsMessage!.text
                    const textInHtml: string = microsoftTeamsMessage!.attachments
                        .find(_ => _.contentType === 'text/html')!
                        .content;

                    const parsedContent = sanitizeHtml(textInHtml, {
                        allowedTags: ['img'],
                        allowedAttributes: {
                            img: ['alt'],
                        },
                    });

                    const replacedText = this.replaceImgTagsWithEmoji(parsedContent);

                    answer = unescapeMessengerServiceCharacters(replacedText);
                } else {
                    answer = microsoftTeamsMessage!.text;
                }

                const validateAnswerData: ValidateAnswerData = {
                    dialogId: dialog._id!.toString(),
                    answer,
                    user: microsoftTeamsMessage!.from.id,
                    activityId: microsoftTeamsMessage!.id,
                    conversation: {
                        conversationType: microsoftTeamsMessage!.conversation.conversationType,
                        tenantId: microsoftTeamsMessage!.conversation.tenantId,
                        id: microsoftTeamsMessage!.conversation.id,
                    },
                    emitNextQuestion: true,
                };

                if (fileAnswers.length > 0) {
                    validateAnswerData.fileAnswers = fileAnswers;
                }

                await this.store.emit<ValidateAnswerData>({
                    actionType: VALIDATE_ANSWER,
                    data: validateAnswerData
                });

                break;
            default:
                break;
        }

        return true;
    }

    private replaceImgTagsWithEmoji(text: string): string {
        const emojiPrefix = '<img alt="';

        const allImgTags = text.match(new RegExp(/<img alt="[^\/]*" \/>/, 'g'));

        if (!allImgTags) {
            return text;
        }

        for (const imgTag of allImgTags) {
            const emoji = imgTag.substr(emojiPrefix.length, 2);

            text = text.replace(imgTag, emoji);
        }

        return text;
    }
}
