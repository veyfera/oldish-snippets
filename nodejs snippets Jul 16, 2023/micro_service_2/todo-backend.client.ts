import { Inject, Injectable } from 'injection-js';
import { Logger } from 'winston';

import { AmqpClient } from './amqp.client';
import { slackTodoBackendApiTx } from '../schemas/amqp/exchanges/slack-todo-backend.api.tx.exchange';
import { DeprecatedMessengerMessage } from '../../../libs/typescript/types/messengers/deprecated-messenger-message';
import { ReportQuestion } from '../types/report-types';

interface IntegrationParams {
    userId: string;
    teamId: string;
    reportId: string;
    questionId?: string;
}

interface IntegrationData {
    todo: string;
    status: string;
    listName: string;
}

interface ChangeTasksParams extends IntegrationParams {
    triggerId: string;
}

export const TODO_COLOR = 'dedede'

@Injectable()
export class TodoBackendClient {
    constructor(
        @Inject('LOGGER') protected logger: Logger,
        protected amqpClient: AmqpClient
    ) {}

    public async getTodoAnswer(props: IntegrationParams): Promise<IntegrationData | false> {
        this.logger.info('Called getTodoAnswer method of TodoBackendClient', {
            props
        });

        const todoAnswer: Promise<IntegrationData> = this.amqpClient.request(slackTodoBackendApiTx.exchange, 'getReportIntegration', props);
        const res: IntegrationData | false = await Promise.race([todoAnswer, resolveAfter(5000)]);

        if (Object.keys(res).length === 0) {
            return false;
        }

        return res;
    }

    public async getReportIntegration(props: IntegrationParams): Promise<Array<string> | false> {
        this.logger.info('Called getReportIntegration method of TodoBackendClient', {
            props
        });

        const integrationData: Promise<Array<string>> = this.amqpClient.request(slackTodoBackendApiTx.exchange, 'getReportIntegration', props); 
        const res: Array<string> | false  = await Promise.race([integrationData, resolveAfter(5000)]);

        if (Object.keys(res).length === 0) {
            return false;
        }

        return res;
    }

    public async changeTasks(integrationData: ChangeTasksParams): Promise<IntegrationData | false> {
        this.logger.info('Called changeTasks method of TodoBackendClient', {
            integrationData
        });

        const res: IntegrationData = await this.amqpClient.request(slackTodoBackendApiTx.exchange, 'changeTasks', integrationData);

        if (Object.keys(res).length === 0) {
            return false;
        }

        return res;
    }
}

const resolveAfter = (delay): Promise<false> =>
  new Promise(resolve => {
    setTimeout(() => {resolve(false)}, delay);
  });
