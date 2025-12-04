import { HttpError } from '../classes/HttpError';
import { IErrorResponse } from '../interfaces/response';
import { ResponseToolkit } from '@hapi/hapi';

export const errorHandler = (h: ResponseToolkit, err: any) => {
  if (err instanceof HttpError) {
    const response: IErrorResponse & { code?: number, results?: any } = {
      error: err.name,
      statusCode: err.status,
      message: err.message,
      code: err.code
    };
    if (err.results !== undefined) {
      response.results = err.results;
    }
    return h.response(response).code(err.status);
  }

  return h.response({
    statusCode: 500,
    error: "Internal server error",
    message: err.message
  } as IErrorResponse).code(500);
}