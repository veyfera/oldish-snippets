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
import { SUBMIT_TODO_ACTION, VALIDATE_ANSWER } from '../action-types';
import { RespondentDialogsCollection } from '../db/respondent-dialogs/respondent-dialogs.collection';
import { ValidateAnswerData } from '../types/reducers-data';

@Injectable()
export class SubmitTodoActionReducer extends Reducer {
    constructor(
        @Inject('STORE') protected store: Store,
        @Inject('LOGGER') protected logger: Logger,
        protected respondentDialogsCollection: RespondentDialogsCollection,
        protected messengerClient: MessengerClient,
    ) {
        super(SUBMIT_TODO_ACTION);
        this.subscribeToStore();
    }

    protected async reduce(data: ExternalInteractiveAction): Promise<boolean> {
        const dialog = await this.respondentDialogsCollection.findById(data.callbackId);

        if (!dialog) {
            this.logger.info('Submit todo action. Dialog has been expired', {
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

        const question = dialog.getCurrentQuestion();
        const todoAnswer = question!.todo!;

        this.logger.info('Submit todo action', dialog.dialog.correlationId);

        await this.store.emit<ValidateAnswerData>({
            actionType: VALIDATE_ANSWER,
            data: {
                dialogId: dialog._id!.toString(),
                answer: todoAnswer,
                channel: data.channelId,
                user: data.userId,
                ts: data!.originalMessage!.ts,
                emitNextQuestion: true
            }
        });

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
            text: `${data.originalMessage!.text}\n>>>${todoAnswer}`,
            replyToId: data.replyToId,
            conversation: data.conversation,
        });

        return true;
    }
}
