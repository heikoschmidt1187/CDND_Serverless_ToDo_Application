import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { genUploadUrl, updAttachmentUrl } from '../../businessLogic/todos'
import { getUserId } from '../utils'
import * as uuid from 'uuid'
import { createLogger } from '../../utils/logger'

const logger = createLogger('generateUploadUrl')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  logger.info('Processing event to generate an upload url', {event})

  // extract user and todo item id
  const todoId = event.pathParameters.todoId
  const userId = getUserId(event)
  const attId = uuid.v4();
  
  // genenerate an uload url
  const uploadUrl = await genUploadUrl(attId)

  // update with the new url
  await updAttachmentUrl(userId, todoId, attId)
  
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      uploadUrl
    })
  }
}
