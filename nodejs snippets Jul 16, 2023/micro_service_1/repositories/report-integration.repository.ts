import { ObjectId } from 'mongodb';

import { Repository } from './repository';
import { ReportIntegrationDoc, ReportQuestion, QuestionIntegration } from '../db/report-integration/report-integration';
import { reportIntegrationCollection } from '../db/report-integration/report-integration.collection';
import { ReportIntegration } from '../entities/report-integration';
import { DueDateRange, getDateRange } from '../utils/datetime';

export class ReportIntegrationRepository extends Repository {
    static async getReportIntegration({ userId, reportId }) {
        const res = await reportIntegrationCollection.findOne({ userId: ObjectId(userId), reportId });

        return res || false;
    }

    static async getQuestionIntegration({ userId, reportId, questionId }: { userId: string, reportId: string, questionId: string}): Promise<Array<QuestionIntegration>> {
        const res = await reportIntegrationCollection.findOne({ userId: ObjectId(userId), reportId });

        if (res) {
            const questionData = res.questions.find(q => q.id === questionId);

            if(questionData) {
                return questionData.integrations;
            }
        }

        return [];
    }

    static async getEnabledQuestion({ userId, reportId }: { userId: string, reportId: string }): Promise<Array<string> | undefined> {
        const res = await this.getReportIntegration({ userId, reportId });

        if (res) {
            const questions = res.questions.filter(q => q.integrations.some(i => i.enabled)).map(q => q.id);
            return questions;
        }
    }

    static async saveIntegration(integration: Partial<ReportIntegration>) {
        integration.userId = ObjectId(integration.userId);
        const query = { userId: integration.userId, reportId: integration.reportId };
        const doc = { $set: integration };
        const options = { upsert: true };
        const res = await reportIntegrationCollection.updateOne(query, doc, options);

        if (res) {
            return true;
        }

        return false;
    }

    static async hasIntegrationWithList({ userId, listId }: { userId: string, listId: string }): Promise<string> {
        const reportIntegrations = await (await reportIntegrationCollection.find({ userId: ObjectId(userId) })).toArray();

        if (reportIntegrations) {
            const firstReportIntegration = reportIntegrations.find(reportIntegration => reportIntegration.questions.find(question => question.integrations.find(integration => integration.list === listId && integration.enabled)))

            return firstReportIntegration?.reportId || '';
        }

        return '';
    }

    private static toEntity(reportIntegrationDoc: ReportIntegrationDoc): ReportIntegration{
        return new ReportIntegration({
            ...reportIntegrationDoc,
            _id: reportIntegrationDoc._id.toString(),
            userId: reportIntegrationDoc.userId?.toString(),
        });
    }

    private static toDoc(reportIntegration: ReportIntegration): ReportIntegrationDoc {
        return new ReportIntegrationDoc({
            ...reportIntegration,
            _id: ObjectId(reportIntegration.id),
            userId: ObjectId(reportIntegration.userId),
        });
    }
}
