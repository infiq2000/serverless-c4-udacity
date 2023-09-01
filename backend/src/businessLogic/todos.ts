import { String } from 'aws-sdk/clients/cloudsearch'
import { TodosAccess } from '../dataLayer/todosAcess'
import { AttachmentUtils } from '../helpers/attachmentUtils'
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'

// TODO: Implement businessLogic
const logger = createLogger('TodoAccess')
const todosAccess = new TodosAccess()
import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)

const bucketName = process.env.S3_BUCKET
const urlExpiration = Number(process.env.SIGNED_URL_EXPIRATION)
const s3 = new XAWS.S3({
  signatureVersion: 'v4'
})
export const createTodo = async (
  userId: string,
  todo: CreateTodoRequest
): Promise<TodoItem> => {
  logger.info(`Creating todo function`)
  const todoId = uuid.v4()
  const s3attachmentUrl = `https://${bucketName}.s3.amazonaws.com/${todoId}`
  const createdAt = new Date().toISOString()
  const newItem = {
    userId,
    todoId,
    createdAt,
    done: false,
    s3attachmentUrl,
    ...todo
  }
  return await todosAccess.createTodoRow(newItem)
}

export const getTodosForUser = async (userId: string) => {
  return todosAccess.getAllTodos(userId)
}

export const updateTodo = async (
  todo: UpdateTodoRequest,
  userId: string,
  todoId: string
) => {
  return todosAccess.updateTodoItem(todo, userId, todoId)
}

export const deleteTodo = async (todoId: string) => {
  return todosAccess.deleteTodo(todoId)
}

export async function generateUploadUrl(
  userId: string,
  todoId: String
): Promise<string> {
  const uploadUrl = s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: todoId,
    Expires: urlExpiration
  })
  await todosAccess.updateUrl(userId, todoId, this.bucketName)

  return uploadUrl
}
