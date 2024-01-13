import { ObjectId } from 'mongodb';

export abstract class Repository {
    static generateId(): string {
        return ObjectId().generate();
    }
}