import { Injectable, Inject } from 'injection-js';
import { Logger } from 'winston';

import { SlackImageBlock } from '../../../../../libs/typescript/types/slack/block-kit/slack-image-block';
import { Reducer } from '../../../core/reducer';
import { Store } from '../../../core/store/store';
import { RECEIVE_BOT_INTEGRATION_ANSWER, SAVE_ANSWER } from '../action-types';
import { RespondentDialogsCollection } from '../db/respondent-dialogs/respondent-dialogs.collection';
import { SaveAnswerData, ReceiveBotIntegrationAnswerData } from '../types/reducers-data';

enum Integrations {
    Giphy = 'giphy'
}

@Injectable()
export class ReceiveBotIntegrationAnswer extends Reducer {
    constructor(
        @Inject('LOGGER') protected logger: Logger,
        @Inject('STORE') protected store: Store,
        protected respondentDialogsCollection: RespondentDialogsCollection
    ) {
        super(RECEIVE_BOT_INTEGRATION_ANSWER);
        this.subscribeToStore();
    }

    protected async reduce({ slackMessage }: ReceiveBotIntegrationAnswerData): Promise<boolean> {
        const dialog = await this.respondentDialogsCollection.getDialogSlack(this.respondentDialogsCollection, {
            userId: slackMessage!.user,
            teamId: slackMessage!.team,
        });

        if (!!dialog && !!dialog.dialog) {
            this.logger.info('Receive bot integration answer', {
                ...dialog.dialog.correlationId,
                answer: slackMessage,
            });

            switch (slackMessage!.botProfile.name) {
                case Integrations.Giphy:
                    const blocks = slackMessage!.blocks;
                    const attachments = slackMessage!.attachments;
                    let imageUrl: string | undefined;

                    if (attachments && attachments[0]) {
                        imageUrl = attachments[0].imageUrl;
                    } else if (blocks && blocks[0]) {
                        imageUrl = (blocks[0] as SlackImageBlock).imageUrl;
                    }

                    await this.store.emit<SaveAnswerData>({
                        actionType: SAVE_ANSWER,
                        data: {
                            dialogId: dialog._id!.toString(),
                            channel: slackMessage!.channel,
                            integrationAnswers: [{ type: 'giphy', data: imageUrl || '' }],
                            answer: imageUrl || '',
                            ts: slackMessage!.ts,
                            emitNextQuestion: true,
                            respondentId: slackMessage!.user,
                        },
                    });

                    break;
                default:
                    this.logger.warn('Unknown bot integration answer', {
                        ...dialog.dialog.correlationId,
                        botProfile: slackMessage!.botProfile,
                    });
                    break;
            }
        } else {
            this.logger.warn('Invalid message', {
                userId: slackMessage!.user,
                slackMessage,
                dialog,
            });
        }

        return true;
    }
}
