import { standuplyApiService } from '../core';
import { ReportIntegrationRepository } from '../repositories/report-integration.repository';
import { ReportQuestion} from '../db/report-integration/report-integration';

interface GetUserReportsProps {
    userId: string;
    teamId: string;
}

export async function getUserReports({ userId, teamId }: GetUserReportsProps): Promise<Array<any>> {
    const reports = await standuplyApiService.getUserReports(userId, teamId);

    return reports || [];
}

export async function getReportIntegrationDetails({ userId, todoList, report }) {
    const details = await ReportIntegrationRepository.getReportIntegration({
        userId: userId,
        reportId: report._id
    });
    const questions = report.questions.filter(q => q.type !== 'say');

    if (details) {
        const oldQuestions: Array<ReportQuestion> = details.questions.map(q => {
            return { ...q, integrations: q.integrations.filter(i => i.list === todoList) }
        });

        const tmp = oldQuestions.find(q => q.integrations.length > 0 && q.integrations[0].timeRange);
        const date = tmp ? tmp.integrations[0].timeRange : 'yesterday';
        const formatedQ = mergeQuestionsAndIntegrations(questions, oldQuestions);

        return { questions: formatedQ, date }
    }

    return { questions: mergeQuestionsAndIntegrations(questions, []), date: 'yesterday' }
}

export async function hasIntegrationWithList({ userId, teamId, listId }: { userId: string, teamId: string, listId: string }) {
    const reportId = await ReportIntegrationRepository.hasIntegrationWithList({ userId, listId });

    return reportId;
}

function mergeQuestionsAndIntegrations(questions, oldQuestions) {
    return questions.map((q, i) => {
        const integration = oldQuestions.find(question => question.id === q.id)?.integrations[0] || {};

        return {
            id: q.id,
            text: q.question,
            enabled: integration?.enabled || false,
            status: integration?.status || ''
        }
    });
}
