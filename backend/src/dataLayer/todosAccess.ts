import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

import { TodoItem } from '../models/TodoItem'
import { loggers } from 'winston'

export class TodosAccess {
    constructor(
        // the document client to access the concrete DynamoDB database
        private readonly docClient: DocumentClient = new AWS.DynamoDB.DocumentClient(),

        // the table containing all TODOs in the database
        private readonly todosTable = process.env.TODOS_TABLE,

        // index to project all TODOs for a specific user
        private readonly todosForUserIndex = process.env.TODOS_FOR_USER_INDEX
    ) {}

    // operation to get all groups for a specific user
    async getAllTodos(userId: string): Promise<TodoItem[]> {

        const result = await this.docClient.query({
            TableName: this.todosTable,
            IndexName: this.todosForUserIndex,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
            ':userId': userId
            }
        }).promise()

        return result.Items as TodoItem[]
    }

    // operation to create a todo item
    async createTodoItem(todoItem: TodoItem) {
        await this.docClient.put({
            TableName: this.todosTable,
            Item: todoItem
        }).promise()
    }
}