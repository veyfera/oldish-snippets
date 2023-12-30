import * as rabbot from 'rabbot';

import { Todo } from '../../../../entities/todo';
import { ActionsMessageBody } from '../../../../types/app-home-message';
import { findTodosForReport } from '../../../../usecases';
import { beautifyDateRange } from '../../../../utils/datetime';
import { shortTodoString } from '../../../../utils/formatting';
import { openModal, updateModal } from '../../../core';
import { MultiSelect } from '../../../shared/ui';

export async function openChangeTasksModal(fakeMessage: any, integrationData, handlerId: string) {
    const todos = await findTodosForReport(integrationData);
    const lists = integrationData.integrations.map(int => typeof int.timeRange === 'string' ? int.timeRange : beautifyDateRange(int.timeRange));
    const modal = await ToDoDetailsModal(todos, lists, handlerId);

    await openModal(fakeMessage as ActionsMessageBody, modal);
}

export async function updateChangeTasksModal(message: ActionsMessageBody, integrationData, handlerId: string, allLists) {
    const todos = await findTodosForReport(integrationData);
    const lists = message.view.state.values.lists.lists.selectedOptions.map(l => l.text.text);
    const modal = await ToDoDetailsModal(todos, allLists, handlerId);

    await updateModal(message, modal);
}

export async function ToDoDetailsModal(todos: Array<Todo>, lists: Array<string>, handlerId: string) {
    return {
        title: {
            type: 'plain_text',
            text: 'Change tasks'
        },
        submit: {
            type: 'plain_text',
            text: 'Save',
            emoji: true
        },
        blocks: [
            MultiSelect({ inputId: 'lists', label: 'TODO list', placeholder: 'Select a list', options: lists, initialValues: lists }),
            ...IntegrationTodos(todos)
        ],
        type: 'modal',
        private_metadata: {
            actionId: handlerId,
        },
        callback_id: 'app_home_todo'
    };
}

function IntegrationTodos(todos: Array<Todo>) {
    if (todos.length === 0){
        return [{
            type: 'section',
            text: {
                type: 'plain_text',
                text: 'No TODO found, try selecting another list',
                emoji: true
            }
        }];
    }

    const todoCheckboxes = [checkboxGroup(todos.slice(0, 10))];

    for (let i = 1; i*10 <= todos.length; i++) {
        todoCheckboxes.push(checkboxGroup(todos.slice(i*10, (i+1)*10)));
    }

    return todoCheckboxes;
}

function checkboxGroup(todos: Array<Todo>) {
    const checkboxOptions = todos.map((todo) => { return {
        text: {
            type: 'mrkdwn',
            text: shortTodoString(todo, 60)
        },
        value: todo.id
    };});

    return {
        type: 'section',
        text: {
            type: 'mrkdwn',
            text: ' '
        },
        accessory: {
            type: 'checkboxes',
            initial_options: checkboxOptions,
            options: checkboxOptions,
            action_id: 'todoCheckboxes'
        }
    };
}
