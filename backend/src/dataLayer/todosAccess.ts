import * as AWS from 'aws-sdk'
import * as AWSXray from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'

import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'

const XAWS = AWSXray.captureAWS(AWS)
const logger = createLogger('todosAccess')

export class TodosAccess {
    constructor(
        // the document client to access the concrete DynamoDB database
        private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),

        // the table containing all TODOs in the database
        private readonly todosTable = process.env.TODOS_TABLE,

        // index to proAWSXRayject all TODOs for a specific user
        private readonly todosForUserIndex = process.env.TODOS_FOR_USER_INDEX,

        // obect to access s3 bucket
        private readonly s3 = new XAWS.S3({signatureVersion: 'v4'}),

        // name of the S3 bucket 
        private readonly bucketName = process.env.ATTACHMENTS_S3_BUCKET,

        // expiration time for signed URL
        private readonly expTime = process.env.SIGNED_URL_EXP
    ) {}

    // operation to get all groups for a specific user
    async getAllTodos(userId: string): Promise<TodoItem[]> {

        logger.info(`Data access getting all TODOs for user ${userId}`, {userId})

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
        logger.info(`Data access creating TODO item  ${todoItem}`, {todoItem})
        
        await this.docClient.put({
            TableName: this.todosTable,
            Item: todoItem
        }).promise()
    }

    // helper to check if item is present
    async itemPresent(todoId: string): Promise<boolean> {

        logger.info(`Data access for checking TODO item ${todoId} presence`, {todoId})
        
        const item = await this.getTodoItem(todoId)
        return !!item
    }

    // helper to get a specific item by id 
    async getTodoItem(todoId: string): Promise<TodoItem> {
        
        logger.info(`Data access for getting TODO item ${todoId} presence`, {todoId})

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
        
        logger.info(`Data access for updating TODO item ${todoId} with update ${todoUpdate}`, {todoId, todoUpdate})

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

        logger.info(`Data access for deleting TODO item ${todoId}`, {todoId})

        await this.docClient.delete({
            TableName: this.todosTable,
            Key: {
                todoId
            }
        }).promise()
    }

    // getter opteration for attachment url
    async getAttachUrl(attId: string): Promise<string> {
        
        logger.info(`Data access for getting upload URL for id ${attId}`, {attId})

        const attUrl = `https://${this.bucketName}.s3.amazonaws.com/${attId}`
        return attUrl
    }

    // getter for upload url
    async getUploadUrl(attId: string): Promise<string> {

        logger.info(`Data access for generating upload URL for id ${attId}`, {attId})

        const upUrl = this.s3.getSignedUrl('putObject', {
            Bucket: this.bucketName,
            Key: attId,
            Expires: this.expTime
        })

        return upUrl
    }

    // update function for attachments
    async updateAttachmentUrl(todoId: string, attachUrl: string) {

        logger.info(`Data access for updating the attachment URL for TODO item ${todoId} and URL ${attachUrl}`, {todoId, attachUrl})

        await this.docClient.update({
            TableName: this.todosTable,
            Key: {
              todoId
            },
            UpdateExpression: 'set attachmentUrl = :attachmentUrl',
            ExpressionAttributeValues: {
              ':attachmentUrl': attachUrl
            }
          }).promise()
    }
}