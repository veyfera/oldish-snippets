import * as rabbot from 'rabbot';

import { IntegrationRequest } from './slack-get-report-integration.consumer';
import { openChangeTasksModal, updateChangeTasksModal  } from '../../app-home/components/ToDos/modals/ChangeTasksModal';
import { registerHandler, removeHandler } from '../../app-home/core';
import { AmqpService } from '../../core/amqp-service/amqp-service';
import { slackTodoBackendApiChangeTasksQ } from '../../core/amqp-service/schema/queues/slack-todo-backend.api.changeTasks.queue';
import { logger } from '../../core/logger';
import { RPCConsumer } from '../../core/rpc-consumer';
import { ReportIntegrationRepository } from '../../repositories/report-integration.repository';
import { TodoRepository } from '../../repositories/todo.repository';
import { authorizeSlackUser } from '../../usecases';
import { beautifyDateRange } from '../../utils/datetime';
import { todoString, formatIntegrationInfo, extractValuesRepeating } from '../../utils/formatting';

interface ChangeTasksRequest extends IntegrationRequest {
    questionId: string;
    triggerId: string;
}

export class SlackChangeTasksConsumer extends RPCConsumer {
    constructor(
        protected amqpService: AmqpService,
    ) {
        super(slackTodoBackendApiChangeTasksQ.queue);
    }

    protected async consumeHandleFunction(message: rabbot.Message): Promise<void> {
        try {
            const res = await this.consumeHandler(message);
        } catch (e: any) {
            console.log('alternate error log: ', e);
            message.ack();
            //await this.processError(message, e);
        }
    }

    protected async consumeHandler(msg: rabbot.Message): Promise<any> {
        const { userId, teamId, reportId, questionId, triggerId } = this.deserializeMessageContent<ChangeTasksRequest>(msg.content);
        const user = await authorizeSlackUser(userId, teamId);

        if (!user) {
            logger.error('User not found', { userId, teamId });
            return;
        }

        const questionIntegration = await ReportIntegrationRepository.getQuestionIntegration({ userId: user.id, reportId , questionId });

        if (!questionIntegration.every(integration => integration.enabled)) {
            return false;
        }

        const CHANGE_TASKS_MODAL_SUBMIT_ACTION_ID = 'change-tasks-modal-submit';
        const handlerId = CHANGE_TASKS_MODAL_SUBMIT_ACTION_ID+msg.properties.messageId;

        // registerHandler is defined inside of consumer to have access to msg.reply and questionIntegration
        registerHandler(handlerId, async ({ context, message }) => {
            //let values: any = {};// unpack values and concat todoCheckboxes to one array
            //Object.values(message.view.state.values).forEach((v: any) => values = mergeWith(values, v, arrayMerge));
            const values = extractValuesRepeating(message.view.state.values);

            const selectedLists = values.lists.selectedOptions.map(l => l.text.text);
            const selectedIntegrations = questionIntegration.filter(int => selectedLists.includes(typeof int.timeRange === 'string' ? int.timeRange : beautifyDateRange(int.timeRange)));

            if (message.type === 'view_submission') {
                const todoIds = values.todoCheckboxes.selectedOptions.map(t => t.value);
                const todos = (await TodoRepository.getByIds(todoIds)).sort((a,b) => todoIds.indexOf(a.id) - todoIds.indexOf(b.id));

                msg.reply(JSON.stringify({ todo: todoString(todos), ...formatIntegrationInfo(selectedIntegrations) }));
                removeHandler(handlerId);
            } else if(message.actions[0].actionId === 'lists' && selectedIntegrations.length > 0) {
                const props = { integrations: selectedIntegrations, userId: user.id, timezone: user.tz };
                const allLists = questionIntegration.map(i => typeof i.timeRange === 'string' ? i.timeRange : beautifyDateRange(i.timeRange));

                await updateChangeTasksModal(message, props, handlerId, allLists);
            }
        });

        const fakeMessage = {
            triggerId,
            team: { id: teamId },
            view: { type: '' }
        };
        const props = {
            userId: user.id,
            integrations: questionIntegration,
            timezone: user.tz,
        };

        await openChangeTasksModal(fakeMessage, props, handlerId);
    }
}
