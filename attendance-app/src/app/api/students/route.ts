import z from 'zod';

import { StudentsController } from '@/controllers/students';
import { ValidationError, AlreadyExistsError, NotFoundError } from '@/errors';
import apiError from '@/errors/apiError';
import logger from '@/logger';

export async function GET() {
  logger.info('Fetching all students');

  try {
    const { students } = await StudentsController.findAll();

    if (students.length === 0) {
      throw new NotFoundError('No students found');
    }

    logger.info(`Fetched [${students.length}] students successfully`);

    return Response.json({ students }, { status: 200 });
  } catch (error) {
    return apiError(error as Error);
  }
}

export async function POST(request: Request) {
  const body = await request.json();

  logger.info(`Creating a new student with registration [${body.registration}]`);

  const createStudentSchema = z.object({
    name: z.string(),
    registration: z.string(),
    photoUrl: z.string(),
  });

  const result = createStudentSchema.safeParse(body);

  try {
    if (!result.success) {
      throw new ValidationError(`Validation error: ${result.error.message}`);
    }

    const { name, registration, photoUrl } = result.data;

    const aldeadyExists = await StudentsController.findByRegistration(registration);

    if (aldeadyExists !== null) {
      throw new AlreadyExistsError(`Student with registration [${registration}] already exists`);
    }

    const { student } = await StudentsController.create({ name, photoUrl, registration });

    logger.info(`Created student with registration [${registration}] successfully`);

    return Response.json({ student }, { status: 200 });
  } catch (error) {
    return apiError(error as Error);
  }
}
