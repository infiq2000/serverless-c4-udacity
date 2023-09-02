import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { getUserId } from '../utils'
import { generateUploadUrl } from '../../businessLogic/todos'
import { createLogger } from '../../utils/logger'

const logger = createLogger('TodoAccess')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
      const todoId = event.pathParameters.todoId

      const userId = getUserId(event)

      const uploadUrl = await generateUploadUrl(userId, todoId)

      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          uploadUrl: uploadUrl
        })
      }
    } catch (e) {
      logger.info('error')
    }
    //return undefined
  }
)

handler.use(httpErrorHandler()).use(
  cors({
    credentials: true
  })
)
