import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic

export class TodosAccess {
  constructor(
    private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
    private readonly todosTable = process.env.TODOS_TABLE
  ) {}
  async createTodoRow(todoRow: TodoItem): Promise<TodoItem> {
    logger.info('Creating todo row')

    const res = await this.docClient
      .put({
        TableName: this.todosTable,
        Item: todoRow
      })
      .promise()

    logger.info('Complete add todo row', res)

    return todoRow as TodoItem
  }
  async getAllTodos(userId: string): Promise<TodoItem[]> {
    logger.info('Fetch all todos for: ', { userId: userId })

    const result = await this.docClient
      .query({
        TableName: this.todosTable,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        }
      })
      .promise()

    const items = result.Items

    logger.info('Fetch complete.', items)

    return items as TodoItem[]
  }

  async updateTodoItem(
    updateTodoParam: UpdateTodoRequest,
    userId: string,
    todoId: string
  ): Promise<void> {
    logger.info(`Update a todo item: ${todoId}`)

    await this.docClient
      .update({
        TableName: this.todosTable,
        Key: {
          userId: userId,
          todoId: todoId
        },
        UpdateExpression: 'set #name=:name, dueDate=:dueDate, done=:done',
        ExpressionAttributeValues: {
          ':name': updateTodoParam.name,
          ':dueDate': updateTodoParam.dueDate,
          ':done': updateTodoParam.done
        },
        ExpressionAttributeNames: {
          '#name': 'name'
        }
      })
      .promise()
  }
  async deleteTodo(todoId: string) {
    logger.info('Delete todo: ', { todoId: todoId })
    await this.docClient
      .delete({
        TableName: this.todosTable,
        Key: {
          todoId: todoId
        }
      })
      .promise()
    logger.info('Delete complete.')
  }

  async updateUrl(
    userId: string,
    todoId: string,
    bucketName: string
  ): Promise<void> {
    await this.docClient
      .update({
        TableName: this.todosTable,
        Key: {
          userId: userId,
          todoId: todoId
        },
        UpdateExpression: 'set attachmentUrl=:attachmentUrl',
        ExpressionAttributeValues: {
          ':attachmentUrl': `https://${bucketName}.s3.amazonaws.com/${todoId}`
        }
      })
      .promise()
  }
}
