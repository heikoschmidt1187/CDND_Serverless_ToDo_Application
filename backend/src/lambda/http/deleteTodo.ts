import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { deleteTodoItem } from '../../businessLogic/todos'
import { getUserId } from '../utils'
import { userInfo } from 'os'

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  // get userid and todo item id
  const todoId = event.pathParameters.todoId
  const userId = getUserId(event)

  // delete todo item
  await deleteTodoItem(userId, todoId)

  return {
    statusCode: 204,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: ''
  }

  return undefined
}
