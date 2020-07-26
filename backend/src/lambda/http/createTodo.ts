import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { createTodo } from '../../businessLogic/todos'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'

// instantiate logger
const logger = createLogger('createTodo')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Processing event to create new TODO item', {event})

  // retrieve user ID
  const userId = getUserId(event)

  // create TODO request
  const newTodoItem: CreateTodoRequest = JSON.parse(event.body)

  // create the item 
  const newItem = await createTodo(userId, newTodoItem)

  // respond
  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      item: newItem
    })
  }
}
