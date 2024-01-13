import { Inject, Injectable } from 'injection-js';
import * as _ from 'lodash';
import { Logger } from 'winston';

import { MessengerClient } from '../../../clients/messenger.client';
import { Reducer } from '../../../core/reducer';
import { Store } from '../../../core/store/store';
import { addTextForErrorMessage } from '../../../helpers/messenger';
import { ExternalInteractiveAction } from '../../../types/internal-types/external-interactive-action';
import { reportExpiredErrorMessage } from '../../../types/messenger-errors';
import { DeprecatedMessengerMessage } from '../../../types/messenger-types';
import { CHANGE_TASKS_ACTION } from '../action-types';
import { RespondentDialogsCollection } from '../db/respondent-dialogs/respondent-dialogs.collection';
import { ValidateAnswerData } from '../types/reducers-data';
import { TodoBackendClient, TODO_COLOR } from '../../../clients/todo-backend.client';

@Injectable()
export class ChangeTasksActionReducer extends Reducer {
    constructor(
        @Inject('STORE') protected store: Store,
        @Inject('LOGGER') protected logger: Logger,
        protected respondentDialogsCollection: RespondentDialogsCollection,
        protected messengerClient: MessengerClient,
        protected todoBackendClient: TodoBackendClient,
    ) {
        super(CHANGE_TASKS_ACTION);
        this.subscribeToStore();
    }

    protected async reduce(data: ExternalInteractiveAction): Promise<boolean> {
        console.log('DATA :', data)
        const dialog = await this.respondentDialogsCollection.findById(data.callbackId);

        if (!dialog) {
            this.logger.info('Change tasks action. Dialog has been expired', {
                dialogId: data.callbackId
            });

            const message: DeprecatedMessengerMessage = {
                messengerType: data.messengerType,
                responseUrl: data.responseUrl,
                replaceOriginal: true,
                type: 'sendErrorMessage',
                to: {
                    teamId: data.teamId,
                    id: data.userId,
                    name: '',
                },
                replyToId: data.replyToId,
                conversation: data.conversation,
            };

            addTextForErrorMessage(message, reportExpiredErrorMessage);

            await this.messengerClient.sendResponse(message);

            return true;
        }

        if (!dialog.dialog) {
            this.logger.error('Failed to get dialog property from document', { document: dialog });
            return false;
        }

        //tmp
        await this.messengerClient.updateResponse({
            messengerType: data.messengerType,
            responseUrl: data.responseUrl,
            type: 'updateWithTextOnly',
            to: {
                teamId: data.teamId,
                id: data.userId,
                name: '',
            },
            replaceOriginal: !!data.originalMessage!.text,
            deleteOriginal: !data.originalMessage!.text,
            text: `${data.originalMessage!.text}`,
            attachments: data.originalMessage!.attachments,
            replyToId: data.replyToId,
            conversation: data.conversation,
        });
        //tmp

        const questionId = dialog.getCurrentQuestion().id;
        const params = {
            userId: dialog.dialog!.respondent.id,
            teamId: dialog.dialog!.respondent!.teamId,
            reportId: dialog.dialog!.correlationId!.reportId,
            questionId,
            triggerId: data!.triggerId!
        };
        const newIntegrationData = await this.todoBackendClient.changeTasks(params);

        if (newIntegrationData) {
            const allAttachmentsExceptTodo = data.originalMessage!.attachments!.filter(a => a.color !== TODO_COLOR);
            console.log('all attachments except todo: ', allAttachmentsExceptTodo)
            const newAttachments = allAttachmentsExceptTodo.concat([
                {
                    color: `#${TODO_COLOR}`,
                    text: `I found the following in your ${newIntegrationData.status} TODO list for ${newIntegrationData.listName}. Send me the comments if you’d like to add something or just click “Submit” to use this data.`,
                    callbackId: data.callbackId,
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
                { text: newIntegrationData.todo, color: `#${TODO_COLOR}` }
            ])


            // save todo to db, for later use in receive-answer.reducer, submit-todo-action.reducer and handle-dialog-timeout.reducer
            await this.respondentDialogsCollection.updateOne(
                { _id: dialog._id, "dialog.questions.id": questionId },
                { $set: { 'dialog.questions.$.todo': newIntegrationData.todo} }
            );

            this.logger.info('Submit todo action', dialog.dialog.correlationId);

            await this.messengerClient.updateResponse({
                messengerType: data.messengerType,
                responseUrl: data.responseUrl,
                type: 'updateWithTextOnly',
                to: {
                    teamId: data.teamId,
                    id: data.userId,
                    name: '',
                },
                replaceOriginal: !!data.originalMessage!.text,
                deleteOriginal: !data.originalMessage!.text,
                text: `${data.originalMessage!.text}`,
                attachments: newAttachments,
                replyToId: data.replyToId,
                conversation: data.conversation,
            });
        }

        return true;
    }
}
