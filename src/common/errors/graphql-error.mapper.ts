import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import { GraphQLFormattedError } from 'graphql';

import { ErrorCode } from './error-code.enum';

const logger = new Logger('GraphQL');

export function graphqlErrorMapper(
  formattedError: GraphQLFormattedError,
  error: any,
): GraphQLFormattedError {
  const originalError = error.originalError;

  if (originalError instanceof HttpException) {
    const status = originalError.getStatus();
    const response = originalError.getResponse();

    const message =
      typeof response === 'object' && response !== null
        ? (response as any).message
        : originalError.message;

    return {
      message: Array.isArray(message) ? message.join(', ') : message,
      extensions: {
        code: mapErrorCode(status),
        statusCode: status,
      },
    };
  }

  return {
    message: 'An unexpected error occurred.',
    extensions: {
      code: ErrorCode.INTERNAL_SERVER_ERROR,
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    },
  };
}

function mapErrorCode(status: number): ErrorCode {
  switch (status) {
    case HttpStatus.BAD_REQUEST:
      return ErrorCode.VALIDATION_ERROR;

    case HttpStatus.NOT_FOUND:
      return ErrorCode.NOT_FOUND;

    default:
      return ErrorCode.INTERNAL_SERVER_ERROR;
  }
}
