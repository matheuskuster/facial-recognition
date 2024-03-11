import logger from '@/logger';

function apiError(error: Error) {
  logger.error(error.message, { error });

  if (error.name === 'NotFoundError') {
    return Response.json({ message: error.message }, { status: 404 });
  }

  if (error.name === 'AlreadyExistsError') {
    return Response.json({ message: error.message }, { status: 400 });
  }

  if (error.name === 'ValidationError') {
    return Response.json({ message: error.message }, { status: 400 });
  }

  return Response.json({ message: error.message }, { status: 500 });
}

export default apiError;
