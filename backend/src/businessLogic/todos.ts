import 'source-map-support/register'

import * as uuid from 'uuid'

import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
import { TodosAccess } from '../dataLayer/todosAccess'
import { createLogger } from '../utils/logger'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'

// instantiate logger object
const logger = createLogger('todosBusinessLogic')

// instantiate concrete data layer access 
const todosAccess = new TodosAccess()

// operation to get all TODOs
export async function getAllTodos(userId: string): Promise<TodoItem[]> {
    logger.info(`Getting all TODOs for user ${userId}`, {userId})
    
    return await todosAccess.getAllTodos(userId)
}

// operation to create a TODO
export async function createTodo(userId: string, createTodoRequest: CreateTodoRequest): Promise<TodoItem> {

    // get a uuid for the new TODO
    const todoId = uuid.v4()

    const newTodoItem: TodoItem = {
        userId,
        todoId,
        createdAt: new Date().toISOString(),
        done: false,
        attachmentUrl: null,
        ...createTodoRequest
    }

    logger.info(`Creating new TODO ${todoId} for user ${userId}`, {userId, todoId, todoItem: newTodoItem})

    // check for string only containing spaces
    if(!createTodoRequest.name.replace(/\s/g, '').length)
        throw new Error('Name containing only spaces not allowed')

    // put to data link
    await todosAccess.createTodoItem(newTodoItem)

    return newTodoItem
}

// operation to update todo elements
export async function updateTodoItem(userId: string, todoId: string, updateTodoRequest: UpdateTodoRequest) {

    logger.info(`Updating TODO ${todoId} for user ${userId}`, {todoId, userId})

    // get the todo item to update
    const todo = await todosAccess.getTodoItem(userId, todoId)

    // check if item is valid
    if(!todo)
        throw new Error('Missing TODO item')

    // check if item belongs to user
    if(todo.userId !== userId) 
        throw new Error('Trying to modify item that does not belong to user')

    // check for string only containing spaces
    if(!updateTodoRequest.name.replace(/\s/g, '').length)
        throw new Error('Name containing only spaces not allowed')

    todosAccess.updateTodoItem(userId, todoId, updateTodoRequest as TodoUpdate)
}

// operation to delete todo elements
export async function deleteTodoItem(userId: string, todoId: string) {

    logger.info(`Deleting TODO ${todoId} for user ${userId}`, {todoId, userId})

    // get the todo item to update
    const todo = await todosAccess.getTodoItem(userId, todoId)

    // check if item is valid
    if(!todo)
        throw new Error('Missing TODO item')

    // check if item belongs to user
    if(todo.userId !== userId) 
        throw new Error('Trying to modify item that does not belong to user')

    todosAccess.deleteTodoItem(userId, todoId)
}

// operation to update the attachment URL of a TODO
export async function updAttachmentUrl(userId: string, todoId: string, attachmentId: string) {

    logger.info(`Creating Attachment URL for TODO ${todoId} for user ${userId} attachmentID ${attachmentId}`, {todoId, userId, attachmentId})

    // get the attachment URL of the TODO and item
    const attUrl = await todosAccess.getAttachUrl(attachmentId)
    const todo = await todosAccess.getTodoItem(userId, todoId)

    // check if item is valid
    if(!todo)
        throw new Error('Missing TODO item')

    // check if item belongs to user
    if(todo.userId !== userId) 
        throw new Error('Trying to modify item that does not belong to user')

    // update the url
    await todosAccess.updateAttachmentUrl(userId, todoId, attUrl)
}

// operation to generate an upload url
export async function genUploadUrl(attachmentId: string): Promise<string> {
    logger.info(`Generating upload URL for ${attachmentId}`, {attachmentId})

    return await todosAccess.getUploadUrl(attachmentId)
}