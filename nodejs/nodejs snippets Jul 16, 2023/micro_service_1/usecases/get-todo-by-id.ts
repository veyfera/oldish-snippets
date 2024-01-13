import { logger } from '../core/logger';
import { Todo } from '../entities/todo';
import { TodoRepository } from '../repositories/todo.repository';

export async function getTodoById(todoId: string): Promise<Todo | undefined> {
    try {
        const todo = await TodoRepository.getById(todoId);

        if (todo) {
            return todo;
        }
    } catch (err: any) {
        logger.error('getTodoById error', { error: err.message, todoId });
    }
}
