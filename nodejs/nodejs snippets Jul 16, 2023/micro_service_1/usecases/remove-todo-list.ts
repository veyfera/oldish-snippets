import { editCustomTodoListReminder } from './edit-custom-todo-list-reminder';
import { logger } from '../core/logger';
import { TodoStatus } from '../entities/todo';
import { TodoListRepository } from '../repositories/todo-list.repository';
import { TodoRepository } from '../repositories/todo.repository';

interface RemoveTodoListProps {
    todoListId: string;
    userId: string;
}

export async function removeTodoList({ todoListId, userId }: RemoveTodoListProps): Promise<void> {
    try {
        const todoList = await TodoListRepository.getById(todoListId);

        await TodoListRepository.delete(todoListId);

        const todos = await TodoRepository.getByListId({ userId, todoListId });

        if (todos.length > 0) {
            for (const todo of todos) {
                todo.status = TodoStatus.Deleted;
            }
    
            await TodoRepository.saveBatch(todos);
        }

        if (todoList.reminders.everyMorning) {
            await editCustomTodoListReminder(todoList.reminders.everyMorning, {
                enabled: false,
            });
        }

        if (todoList.reminders.endOfTheDay) {
            await editCustomTodoListReminder(todoList.reminders.endOfTheDay, {
                enabled: false,
            });
        }
    } catch (err: any) {
        logger.error('removeTodoList error', { error: err.message, todoListId });
    }
}
