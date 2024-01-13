import { ReportIntegrationDoc } from './report-integration';
import { MongoCollection } from '../../core/collection';
import { instantiate } from '../../utils/instantiate';

export class ReportIntegrationCollection extends MongoCollection<ReportIntegrationDoc> {
    constructor() {
        super('report-integrations');
    }

    protected transformTo(data: Object): ReportIntegrationDoc {
        return instantiate<ReportIntegrationDoc>(ReportIntegrationDoc, data);
    }
}

export const reportIntegrationCollection = new ReportIntegrationCollection();
