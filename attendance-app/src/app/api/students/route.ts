import z from 'zod';

import { S3Controller } from '@/controllers/s3';
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
  const body = await request.formData();

  logger.info(`Creating a new student with registration [${body.get('registration')}]`);

  const createStudentSchema = z.object({
    name: z.string(),
    registration: z.string(),
    photo: z.instanceof(File),
  });

  const result = createStudentSchema.safeParse({
    name: body.get('name'),
    registration: body.get('registration'),
    photo: body.get('photo'),
  });

  try {
    if (!result.success) {
      throw new ValidationError(`Validation error: ${result.error.message}`);
    }

    const { name, registration } = result.data;

    const aldeadyExists = await StudentsController.findByRegistration(registration);

    if (aldeadyExists !== null) {
      throw new AlreadyExistsError(`Student with registration [${registration}] already exists`);
    }

    const { url } = await S3Controller.uploadFile(result.data.photo);

    const { student } = await StudentsController.create({ name, photoUrl: url, registration });

    logger.info(`Created student with registration [${registration}] successfully`);

    return Response.json({ student }, { status: 200 });
  } catch (error) {
    return apiError(error as Error);
  }
}
