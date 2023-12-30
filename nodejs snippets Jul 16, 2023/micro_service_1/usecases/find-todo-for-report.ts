import { Divider, Button } from '../app-home/shared/ui';
import { ReportQuestion, QuestionIntegration } from '../db/report-integration/report-integration';
import { Todo, TodoStatus } from '../entities/todo';
import { TodoRepository } from '../repositories/todo.repository';
import { DueDateRange, DateRange, beautifyTimeRange } from '../utils/datetime';
import { shortenDescription } from '../utils/formatting';

interface FindTodoForReportProps {
    userId: string;
    integrations: Array<QuestionIntegration>;
    timezone: string;
}

export interface IntegrationData {
    todo: string;
    status: string;
    listName: string;
}

export async function findTodosForReport({ integrations, userId, timezone }: FindTodoForReportProps): Promise<Array<Todo>> {
    const todos: Todo[] = [];

    for (let integration of integrations) {
        if (!integration.enabled) {
            continue;
        }

        const params = {
            userId,
            timezone,
            status: integration.status,
            dueDateRange: integration.timeRange as DueDateRange,
            offset: 0
        };
        const tmpTodos = await TodoRepository.getByDueDateRange(params);

        if (tmpTodos.length > 0) {
            todos.push(...tmpTodos);
        }
    }

    if (todos.length > 0) {
        return todos;
    } else {
        return [];
    }
}

