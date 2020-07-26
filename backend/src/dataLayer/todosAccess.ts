import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
import { HTTPVersionNotSupported } from 'http-errors'

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

    // helper to check if item is present
    async itemPresent(todoId: string): Promise<boolean> {
        const item = await this.getTodoItem(todoId)
        return !!item
    }

    // helper to get a specific item by id 
    async getTodoItem(todoId: string): Promise<TodoItem> {

        // get the item from the database
        const result = await this.docClient.get({
            TableName: this.todosTable,
            Key: {
                todoId
            }
        }).promise()

        return result.Item as TodoItem
    }

    // operation to update an existing item
    async updateTodoItem(todoId: string, todoUpdate: TodoUpdate) {

        await this.docClient.update({
            TableName: this.todosTable,
            Key: {
                todoId
            },
            UpdateExpression: 'set #name = :name, dueDate = :dueDate, done = :done',
            ExpressionAttributeNames: {
                "#name": "name"
            },
            ExpressionAttributeValues: {
                ":name": todoUpdate.name,
                ":dueDate": todoUpdate.dueDate,
                ":done": todoUpdate.done
            }
        }).promise()
    }

    // operation to delete a TODO item
    async deleteTodoItem(todoId: string) {

        await this.docClient.delete({
            TableName: this.todosTable,
            Key: {
                todoId
            }
        }).promise()
    }
}