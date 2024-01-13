import { ReportIntegrationRepository } from '../repositories/report-integration.repository';
import { QuestionIntegration } from '../db/report-integration/report-integration';

interface SingleReportIntegration {
    userId: string;
    reportId: string;
    questions: Array<questionWs>
}

interface questionWs {
    id: string;
    integrations: QuestionIntegration;
}

export async function saveReportIntegration(integration: SingleReportIntegration) {
    const todoList = integration.questions[0].integrations.list;
    const oldIntegration = await ReportIntegrationRepository.getReportIntegration({
        userId: integration.userId,
        reportId: integration.reportId
    });
    const newQuestions = integration.questions.map(q => {
        const oldQuestion = oldIntegration && oldIntegration.questions.find(oldQuestion => oldQuestion.id === q.id);

        if (oldQuestion) {
            const oldIntegration = oldQuestion.integrations.filter(integration => integration.list !== todoList);

            return { id: q.id, integrations: oldIntegration.concat([q.integrations]) };
        }

        return { id: q.id, integrations: [q.integrations] };
    })

    const newIntegration = { ...integration , questions: newQuestions };

    await ReportIntegrationRepository.saveIntegration(newIntegration);
}
