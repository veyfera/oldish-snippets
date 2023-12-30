import { Inject, Injectable } from 'injection-js';
import * as _ from 'lodash';
import { Logger } from 'winston';

import { Subject } from 'rxjs/Subject';

import {
    transformToExternalInteractiveActionFromSlackInteractiveAction,
    transformToExternalRestartReportFromSlackInteractiveAction
} from '../../../helpers/mappers/slack/interactive-action.mapper';
import { ExternalInteractiveAction } from '../../../types/internal-types/external-interactive-action';
import { ExternalRestartReport } from '../../../types/internal-types/external-restart-report';
import { SlackInteractiveAction } from '../../../types/slack-types';
import { SlackInteractiveResponse } from '../../../types/slack-types/slack-interactive-response';
import { AmqpService } from '../../shared/amqp-service/amqp.service';
import { slackControlActionsTx } from '../../shared/amqp-service/types/exchanges/slack-control-actions-tx.exchange';
import { ActionsServer } from '../actions-server';

interface DoPublishParams {
    routingKey: string;
    body: SlackInteractiveAction;
}

@Injectable()
export class InteractiveActionsProducer {
    protected  readonly routingKeys: Array<string> = slackControlActionsTx.bindings.map(_ => _['routingPattern']);
    protected  readonly doPublishStreams: Map<string, Subject<DoPublishParams>> = new Map<string, Subject<DoPublishParams>>();

    constructor(
        @Inject('LOGGER') protected logger: Logger,
        protected amqpService: AmqpService,
        protected server: ActionsServer
    ) {
        this.server.onMessageType('interactive_message', async (body: SlackInteractiveAction) => this.handle(body));
    }

    public async handle(body: SlackInteractiveAction): Promise<SlackInteractiveResponse | void> {
        const control = _.get(body, 'actions[0]');

        this.logger.info('Receive slack control action', { body });

        if (!!control) {
            const routingKey: string = _.snakeCase(control['name'].toLowerCase());

            if (this.routingKeys.indexOf(routingKey) === -1) {
                return;
            }

            const teamUserActionKey: string = `${body.team.id}_${body.user.id}_${routingKey}`;

            let doPublish: Subject<DoPublishParams> | undefined = this.doPublishStreams.get(teamUserActionKey);

            if (!doPublish) {
                // init collector
                doPublish = new Subject<DoPublishParams>();

                doPublish
                    .debounceTime(1000)
                    .first()
                    .subscribe(async ({routingKey, body}) => {
                        // remove collector
                        this.doPublishStreams.delete(teamUserActionKey);

                        try {
                            switch (routingKey) {
                                case 'answer_later':
                                case 'answer_later_time':
                                case 'quick_answer':
                                case 'select_subject':
                                case 'submit_todo':
                                case 'change_tasks':
                                    const externalInteractiveAction: ExternalInteractiveAction = transformToExternalInteractiveActionFromSlackInteractiveAction(body);
                                    await this.amqpService.publish(slackControlActionsTx.exchange, routingKey, externalInteractiveAction, { persistent: true });
                                    break;
                                case 'restart_report':
                                case 'add_answers':
                                    const externalRestartReport: ExternalRestartReport = transformToExternalRestartReportFromSlackInteractiveAction(body);
                                    await this.amqpService.publish(slackControlActionsTx.exchange, routingKey, externalRestartReport, { persistent: true });
                                    break;
                                default:
                                    await this.amqpService.publish(slackControlActionsTx.exchange, routingKey, body, { persistent: true });
                                    break;
                            }
                        } catch (error) {
                            this.logger.error('Failed to publish message', {
                                error,
                                message: body
                            });
                        }
                    });

                this.doPublishStreams.set(teamUserActionKey, doPublish);
            }

            // collect calls for same user's action to prevent multiple presses
            // only last call of doPublish (after 1s delay) for corresponding user's action will be applied
            doPublish.next({routingKey, body});

            return {
                replaceOriginal: true,
                attachments: [
                    {
                        fallback: '',
                        text: 'Processing..',
                        imageUrl: 'https://example.com/img/bot/preloader-ellipsis.gif'
                    }
                ]
            };
        } else {
            this.logger.warn('Unknown control', { body });
        }
    }
}
