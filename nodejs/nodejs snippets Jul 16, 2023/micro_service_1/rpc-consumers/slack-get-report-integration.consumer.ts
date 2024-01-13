import * as rabbot from 'rabbot';

import { AmqpService } from '../../core/amqp-service/amqp-service';
import { slackTodoBackendApiGetReportIntegrationQ } from '../../core/amqp-service/schema/queues/slack-todo-backend.api.getReportIntegration.queue';
import { logger } from '../../core/logger';
import { RPCConsumer } from '../../core/rpc-consumer';
import { ReportIntegrationRepository } from '../../repositories/report-integration.repository';
import { authorizeSlackUser, findTodosForReport } from '../../usecases';
import { todoString, formatIntegrationInfo } from '../../utils/formatting';

export interface IntegrationRequest {
    userId: string;
    teamId: string;
    reportId: string;
    questionId?: string;
}

export class SlackGetReportIntegrationConsumer extends RPCConsumer {
    constructor(
        protected amqpService: AmqpService,
    ) {
        super(slackTodoBackendApiGetReportIntegrationQ.queue);
    }

    protected async consumeHandler(msg: rabbot.Message): Promise<any> {
        const { userId, teamId, reportId, questionId } = this.deserializeMessageContent<IntegrationRequest>(msg.content);
        const user = await authorizeSlackUser(userId, teamId);

        if (!user) {
            logger.error('User not found', { userId, teamId });
            return;
        }

        if (questionId) {
            const questionIntegration = await ReportIntegrationRepository.getQuestionIntegration({ userId: user.id, reportId , questionId });

            if (questionIntegration.every(integration => !integration.enabled)) {
                return false;
            }

            const todos = await findTodosForReport({ integrations: questionIntegration, userId: user.id, timezone: user.tz });

            return { todo: todoString(todos),  ...formatIntegrationInfo(questionIntegration) };
        } else {
            return ReportIntegrationRepository.getEnabledQuestion({ userId: user.id, reportId });
        }
    }
}
