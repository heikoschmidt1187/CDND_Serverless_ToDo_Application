import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'

import { createLogger} from '../../utils/logger'
import { getAllTodos } from '../../businessLogic/todos'
import { getUserId } from '../utils'

// instantiate logger
const logger = createLogger('getTodos')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Processing event getTodos', {event})

  // retrieve the userID
  const userId = getUserId(event)
  console.log('did get user id ', userId)

  // retrieve the TODOs
  const items = await getAllTodos(userId)
  console.log('did get todos')

  // form the response header
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      items
    })
  }
}
