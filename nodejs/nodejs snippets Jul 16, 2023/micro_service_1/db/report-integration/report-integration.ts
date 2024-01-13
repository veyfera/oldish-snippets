import { ObjectID } from 'mongodb';

import { TodoStatus } from '../../entities/todo';
import { DueDateRange, DateRange } from '../../utils/datetime';
import { MongoDocument } from '../../utils/mongo-document';

export interface QuestionIntegration {
    list: string;
    enabled: boolean;
    status: TodoStatus;
    timeRange: DueDateRange | DateRange; 
}

export interface ReportQuestion {
    id: string;
    integrations: Array<QuestionIntegration>;
}

export class ReportIntegrationDoc extends MongoDocument {
    _id: ObjectID = undefined;
    userId: ObjectID;
    reportId: string = '';
    questions: Array<ReportQuestion> = [];

    constructor(params?: Partial<ReportIntegrationDoc>) {
        super(params);

        if (params) {
            this.init(params);
        }
    }
}
