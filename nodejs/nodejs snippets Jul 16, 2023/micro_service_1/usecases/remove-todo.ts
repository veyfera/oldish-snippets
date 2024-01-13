import { logger } from '../core/logger';
import { TodoRepository } from '../repositories/todo.repository';

export async function removeTodo(todoId: string): Promise<void> {
    try {
        await TodoRepository.delete(todoId);
    } catch (err: any) {
        logger.error('removeTodo error', { error: err.message, todoId });
    }
}
