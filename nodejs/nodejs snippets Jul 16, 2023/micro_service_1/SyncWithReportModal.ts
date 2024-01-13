import { registerHandler, openModal, updateModal, updateModalAfterNextAction } from '../../../core';
import { AppHomeContext } from '../../../core/app-home-context';
import { MdCheckbox, Confirm, Datepicker, StaticSelect, TextSection } from '../../../shared/ui';
import { TodoStatusText } from '../../ToDos/Labels';
import { todoPastLists } from '../todo-default-lists';
import { extractValuesRepeating } from '../../../../utils/formatting';
import { getUserReports, getReportIntegrationDetails, saveReportIntegration } from '../../../../usecases';
import { ActionsMessageBody } from '../../../../types/app-home-message';

export async function openSyncWithReportModal(context, message) {
    const modal = await SyncWithReportModal({ context, message });

    await openModal(message, modal);
}

async function updateSyncWithReportModal({ context, message }) {
    message.view.rootViewId = message.view.id;
    const modal = await SyncWithReportModal({ context, message });

    await updateModal(message, modal);
}

const SYNC_WITH_REPORT_MODAL_SUBMIT_ACTION_ID = 'sync-with-report-modal';

registerHandler(
    'sync-report',
    updateSyncWithReportModal
)
registerHandler(
    'sync-date',
    updateSyncWithReportModal
)

registerHandler(
    SYNC_WITH_REPORT_MODAL_SUBMIT_ACTION_ID,
    updateModalAfterNextAction({ name: 'ToDoListSettingsModal' } as Function),
    async ({ context, message }) => {
        const values = extractValuesRepeating(message.view.state.values, false);
        let timeRange = values.syncDate.selectedOption.value;

        if (timeRange === 'custom') {
            timeRange = { gte: new Date(values.startDate.selectedDate), lte: new Date(values.endDate.selectedDate) };
        }

        const questions = values.checkboxesAction.map((q, i) => {
            return {
                id: q.selectedOptions[0]?.value || q?.blockId.replace(/#/g, '-'),// replace needed to avoid camelization of questionIds
                integrations: {
                    enabled: !!q.selectedOptions[0]?.value,// is checkbox checked
                    status: values.status[i].selectedOption?.value || 'completed',
                    timeRange: timeRange,
                    list: context.todoList
                }
            }
        })
        const integrationForCurrentList = {
            userId: context.userId,
            reportId: values.syncReport.selectedOption.value,
            questions: questions
        }
        await saveReportIntegration(integrationForCurrentList);
    }
)

async function SyncWithReportModal({ context, message }: { context: AppHomeContext, message: ActionsMessageBody }) {
    const values = extractValuesRepeating(message.view.state.values, false);
    const reportId = values?.syncReport?.selectedOption?.value || (context as any).state.reportId;
    const reports = await getUserReports({ userId: message.user.id, teamId: message.user.teamId })
    const report = reports.find(r => r._id === reportId);

    const { questions, date } = reportId ? await getReportIntegrationDetails({ userId: context.userId, todoList: context.todoList, report }): { questions:[], date: {} }
    const selectedDate = date || 'yesterday';

    return {
        title: {
            type: 'plain_text',
            text: `Sync with ${report ? report.title.slice(0, 8) + '...' : 'report'}`
        },
        submit: {
            type: 'plain_text',
            text: 'Save'
        },
        type: 'modal',
        blocks: [
            ...(reports.length > 0 ? [ReportSelect(reports, report)] : [TextSection('You do not have any reports yet')]),
            ...(reportId ? [
                ...Questions(questions),
                DatePicker(selectedDate),
                ...( selectedDate === 'custom' || typeof selectedDate !== 'string' ? [DatePickerCustom(selectedDate)] : [])
            ] : [])
        ],
        private_metadata: {
            ...context.getMetadata(),
            reportId: values?.syncReport?.selectedOption?.value,
            actionId: SYNC_WITH_REPORT_MODAL_SUBMIT_ACTION_ID,
        },
        callback_id: 'app_home_todo'
    };
}


function ReportSelect(reports, report) {
    const select: any = StaticSelect({
        inputId: 'sync-report',
        label: 'sync-report',
        placeholder: 'Select report',
        options: reports,
        keys: { text: 'title', value: '_id' },
        ...(report && { initialValue: { text: report.title, value: report._id } })
    }).element;

    if (report) {
        select.confirm = Confirm({
            title: 'Are you sure?',
            text: 'If you switch to another report now, all your changes will not be saved',
            confirm: 'Switch anyway',
            deny: 'Stop, I\'ve changed my mind!'
        });
    }

    return {
        type: 'section',
        text: {
            type: 'mrkdwn',
            text: 'Pick a report from the dropdown list'
        },
        accessory: select,
    }
};

function controlsC(status?, blockId?) {
    const statuses =  Object.entries(TodoStatusText).slice(0, -1).map(s => { return { text: `${s[1]} list`, value: s[0] } });
    const initialText = TodoStatusText[status];

    return {
        type: 'actions',
        block_id: `${blockId}${blockId[0]}`,
        elements: [StaticSelect({
            inputId: 'status',
            label: 'Sync question with tasks from',
            placeholder: 'Sync question with tasks from',
            options: statuses,
            keys: { text: 'text', value: 'value' },
            ...(initialText && { initialValue: { text: `${initialText} list`, value: status} })
        }).element]
    }
};

function Questions(questions) {

    const formatedQuestions = questions.map(question => [{
        type: 'section',
        text: {
            type: 'mrkdwn',
            text: ' '
        },
        block_id: `${question.id.replace(/-/g, '#')}`,// replace needed to avoid camelization of questionIds
        accessory: MdCheckbox(question.text, question.id, question.enabled)
    },
    controlsC(question.status, question.id),
    {
        type: 'divider'
    }])

    return formatedQuestions.flat(1);
}

function DatePicker(date) {
    const safeDate = typeof date !== 'string' ? 'custom' : date;
    const initialDate = { text: todoPastLists.find(l => l.value === safeDate)!.text, value: safeDate };

    return {
        type: 'section',
        text: {
            type: 'mrkdwn',
            text: 'Data range synchronization:'
        },
        accessory: StaticSelect({
            inputId: 'sync-date', 
            label: 'Select date',
            placeholder: 'Select date',
            options: todoPastLists,
            keys: { text: 'text', value: 'value' },
            initialValue: initialDate
        }).element,
    }
};

//function DatePickerCustom(startDate?, endDate?) {
function DatePickerCustom(dateRange: any) {
    const startDate = dateRange.gte;
    const endDate = dateRange.lte

    return {
        type: 'actions',
        elements: [
            Datepicker({ inputId: 'startDate', label: 'Start date', placeholder: 'Start date', initialValue: startDate }).element,
            Datepicker({ inputId: 'endDate', label: 'End date', placeholder: 'End date', initialValue: endDate }).element,
        ]
    }
};
