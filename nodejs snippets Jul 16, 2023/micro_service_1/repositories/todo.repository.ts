
import { ObjectId } from 'mongodb';

import { Repository } from './repository';
import { TodoDoc } from '../db/todo/todo';
import { todoCollection } from '../db/todo/todo.collection';
import { Todo, TodoStatus } from '../entities/todo';
import { TODOS_PER_PAGE } from '../usecases';
import { DueDateRange, getDateRange, DateRange } from '../utils/datetime';

export class TodoRepository extends Repository {
    static async getByListId({ userId, todoListId, offset }: { userId: string, todoListId: string, offset?: number }): Promise<Array<Todo>> {
        // TODO: remove userId for query? because todoListId is enough.
        const query = { userId: ObjectId(userId), todoListId: ObjectId(todoListId), status: { $ne: TodoStatus.Deleted } };

        if (offset !== undefined) {
            return await this.aggregateWithSubtasksCount(query, offset, TODOS_PER_PAGE + 1);
        }

        return (await (await todoCollection.find(query)).toArray()).map(this.toEntity);
    }

    static async getById(todoId: string): Promise<Todo> {
        const doc = (await todoCollection.findOne({
            _id: ObjectId(todoId)
        }));

        if (!doc) {
            throw new Error('Todo not found');
        }

        return this.toEntity(doc);
    }

    static async getByIds(todoIds: Array<string>): Promise<Array<Todo>>{
        const docs = await (await todoCollection.find({
            _id: { $in: todoIds.map(id => ObjectId(id)) }
        })).toArray();

        return docs.map(this.toEntity);
    } 

    static async getByParentTodoId({ userId, parentTodoId }: { userId: string, parentTodoId: string }): Promise<Array<Todo>> {
        const docs = await (await todoCollection.find({
            userId: ObjectId(userId),
            parentTodoId: ObjectId(parentTodoId),
            status: { $ne: TodoStatus.Deleted }
        })).toArray();

        return docs.map(this.toEntity);
    }

    static async getByDueDateRange({ 
        userId, 
        timezone, 
        dueDateRange, 
        offset,
        status
    }: { userId: string, timezone: string, dueDateRange: DueDateRange | DateRange, offset?: number, status?: TodoStatus }): Promise<Array<Todo>> {
        const ranges = typeof dueDateRange === 'string' ? getDateRange(timezone, dueDateRange) : dueDateRange;

        if (!ranges) {
            throw Error('Error while trying to get todos by due date range');
        }
        const { lte, gte } = ranges;

        const query = { userId: ObjectId(userId), ...(status && { status }), dueDate: { $lte: lte, $gte: gte }, parentTodoId: null };

        if (offset !== undefined) {
            return await this.aggregateWithSubtasksCount(query, offset, TODOS_PER_PAGE + 1);
        }

        return (await (await todoCollection.find(query)).toArray()).map(this.toEntity);
    }

    static async insert(todo: Todo): Promise<TodoDoc> {
        const result = await todoCollection.insertOne(this.toDoc(todo));
        const insertedTodo = result.ops[0];

        return insertedTodo;
    }

    static async saveBatch(todos: Todo[]): Promise<void> {
        const ops: object[] = [];

        for (const todo of todos) {

            const update = this.newUpdate(todo);

            ops.push({
                updateOne: {
                    filter: { _id: ObjectId(todo.id) },
                    update,
                    upsert: true,
                }
            });
        }

        await todoCollection.bulkWrite(ops);
    }

    static async save(todo: Todo): Promise<void> {
        const filter = { _id: ObjectId(todo.id) };
        const update = this.newUpdate(todo);

        await todoCollection.updateOne(filter, update);
    }

    static async delete(todoId: string): Promise<void> {
        const filter = { $or: [{ _id: ObjectId(todoId) }, { parentTodoId: ObjectId(todoId) }] };
        const deleteDocs = {
            $set: {
                status: TodoStatus.Deleted
            }
        };

        await todoCollection.updateOne(filter, deleteDocs);
    }

    private static toEntity(todoDoc: TodoDoc): Todo {
        return new Todo({
            ...todoDoc,
            _id: todoDoc._id.toString(),
            userId: todoDoc.userId?.toString(),
            todoListId: todoDoc.todoListId?.toString(),
            parentTodoId: todoDoc.parentTodoId?.toString(),
        });
    }

    private static toDoc(todo: Todo) {
        return new TodoDoc({
            _id: ObjectId(todo.id),
            title: todo.title,
            description: todo.description,
            priority: todo.priority,
            done: todo.done,
            status: todo.status,
            dueDate: todo.dueDate,
            createdAt: todo.createdAt,
            userId: todo.userId ? ObjectId(todo.userId) : undefined,
            todoListId: todo.todoListId ? ObjectId(todo.todoListId) : undefined,
            parentTodoId: todo.parentTodoId ? ObjectId(todo.parentTodoId) : undefined,
        });
    }

    private static newUpdate(todo: Todo) {
        let update: Partial<Todo> = {};

        for (const key of todo.changes) {
            update = {
                ...update,
                [key]: todo[key]
            };
        }

        if (update.userId) {
            update.userId = ObjectId(update.userId);
        }

        if (update.todoListId) {
            update.todoListId = ObjectId(update.todoListId);
        }

        if (update.parentTodoId) {
            update.parentTodoId = ObjectId(update.parentTodoId);
        }

        return { $set: update };
    }

    private static async aggregateWithSubtasksCount(query, offset, limit) {
        const res = await (await todoCollection.aggregate([
            { $match: { status: { $ne: TodoStatus.Deleted }, ...query } },
            { $match: query },
            { $skip: offset },
            { $limit: limit },
            { $lookup: { from: 'todos', localField: '_id', foreignField: 'parentTodoId', as: 'subtasks' } },
            { $addFields: { 'subtasksCount.all': { $size: { $filter: { input: '$subtasks', as: 'subtask', cond: { $ne: ['$$subtask.status', TodoStatus.Deleted] } } } } } },
            {
                $addFields: {
                    'subtasksCount.done': {
                        $size: {
                            $filter: {
                                input: '$subtasks', as: 'subtask', cond: {
                                    $and: [
                                        { $ne: ['$$subtask.status', TodoStatus.Deleted] },
                                        { $eq: ['$$subtask.done', true] }
                                    ]
                                }
                            }
                        }
                    }
                }
            },
            { $project: { subtasks: 0 } },
        ])).toArray();

        return res.map(this.toEntity);
    }
}
