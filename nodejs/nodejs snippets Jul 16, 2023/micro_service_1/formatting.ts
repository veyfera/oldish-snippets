import { capitalize, mergeWith, isArray } from 'lodash';

import { beautifyDateRange } from './datetime';
import { ReportQuestion, QuestionIntegration } from '../db/report-integration/report-integration';
import { Todo } from '../entities/todo';


const DESCRIPTION_MAX_LENGTH = 146;
const LINE_BREAKS_REG_EXP = /(\r\n|\n|\r)/gm;

export function shortenDescription(description: string): string {
    let shortDescription = description.replace(LINE_BREAKS_REG_EXP, '');

    if (shortDescription.length > DESCRIPTION_MAX_LENGTH) {
        shortDescription = `${description.slice(0, DESCRIPTION_MAX_LENGTH-3)}...`;
    }

    return shortDescription;
}

export function todoString(todos: Array<Todo>): string{
    return todos.map((todo) => {
        const title = todo.title;
        const desc = todo.description ? `- ${todo.description}` : '';
        const worklog = todo.worklog ? `- ${todo.worklog}` : '';

        return `• _${title} ${desc} ${worklog}_`;
    }).join('\n');
};

export function shortTodoString(todo: Todo, descriptionMaxLength: number): string{
    const title = todo.title;
    let desc = todo.description ? `- ${todo.description}` : '';
    const worklog = todo.worklog ? `- ${todo.worklog}` : '';

    if (desc.length > descriptionMaxLength) {
        desc = `${desc.slice(0, descriptionMaxLength)}...`;
    }

    return `_${title} ${desc} ${worklog}_`;
};

export function formatIntegrationInfo(integrations: Array<QuestionIntegration>) {
    let listName = '';
    let status = '';

    for (let integration of integrations) {
        status += `${integration.status}, `;

        if (typeof integration.timeRange === 'string') {
            listName += `${capitalize(integration.timeRange)}, `;
        } else {
            listName += `${beautifyDateRange(integration.timeRange)}, `;
        }
    }
    listName = listName.slice(0, -2);
    status = status.slice(0, -2);

    return { status, listName };
};

export function extractValues(values): any {
    let extractedValues: any = {};// unpack values for ease of use
    Object.values(values).forEach(v => Object.assign(extractedValues, v));

    return extractedValues;
}

export function extractValuesRepeating(values: any, outputSingleArray:boolean = true): any {
    let extractedValues: any = {};// unpack values for ease of use
    Object.entries(values).forEach((v: any) => {
        const key = Object.keys(v[1])[0];
        v[1][key].blockId = v[0];
        values = mergeWith(extractedValues, v[1], outputSingleArray ? arrayMerge : objectMerge)
    });

    return extractedValues;
}

function arrayMerge(objValue, srcValue) {
    /*output eg.   todoCheckboxes: {
        type: 'checkboxes',
        selectedOptions: [
            [Object], [Object],
            [Object], [Object]
            ]
      }*/
    if (isArray(objValue)) {
        return objValue.concat(srcValue);
    }
}

function objectMerge(objValue, srcValue) {
    /* output eg.   todoCheckboxes: [
       { type: 'checkboxes', selectedOptions: [Array] },
       { type: 'checkboxes', selectedOptions: [] }
    ]*/
    if (isArray(objValue)) {
        return objValue.concat(srcValue);
    } else if(typeof objValue === 'object') {
        return [objValue, srcValue];
    }
}
