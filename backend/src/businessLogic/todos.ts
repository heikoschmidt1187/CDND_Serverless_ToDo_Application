import 'source-map-support/register'

import * as uuid from 'uuid'

import { TodoItem } from '../models/TodoItem'
import { TodosAccess } from '../dataLayer/todosAccess'
import { createLogger } from '../utils/logger'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'

// instantiate logger object
const logger = createLogger('todosBusinessLogic')

// instantiate concrete data layer access 
const todosAccess = new TodosAccess()

// operation to get all TODOs
export async function getAllTodos(userId: string): Promise<TodoItem[]> {
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

    // put to data link
    await todosAccess.createTodoItem(newTodoItem)

    return newTodoItem
}