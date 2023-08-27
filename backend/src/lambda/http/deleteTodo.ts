import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { cors, httpErrorHandler } from 'middy/middlewares'
import * as middy from 'middy'
import { deleteTodo } from '../../businessLogic/todos'
import { getUserId } from '../utils'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    const userId = getUserId(event)

    await deleteTodo(userId, todoId)

    return {
      statusCode: 202,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({})
    }
  }
)

handler.use(httpErrorHandler()).use(
  cors({
    credentials: true
  })
)
