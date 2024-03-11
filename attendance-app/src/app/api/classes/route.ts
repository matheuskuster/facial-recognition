import z from 'zod';

import { ClassesController } from '@/controllers/classes';
import { NotFoundError, ValidationError } from '@/errors';
import apiError from '@/errors/apiError';
import logger from '@/logger';

export async function GET() {
  logger.info('Fetching all classes');

  try {
    const { classes } = await ClassesController.findAll();

    if (classes.length === 0) {
      throw new NotFoundError('No classes found');
    }

    logger.info(`Fetched [${classes.length}] classes successfully`);

    return Response.json({ classes }, { status: 200 });
  } catch (error) {
    return apiError(error as Error);
  }
}

export async function POST(request: Request) {
  const body = await request.json();

  logger.info(`Creating a new class [${body.name}]`);

  const createStudentSchema = z.object({
    name: z.string(),
    abbreviation: z.string(),
    teacher: z.string(),
    totalHours: z.number().min(1),
  });

  const result = createStudentSchema.safeParse(body);

  try {
    if (!result.success) {
      throw new ValidationError(`Validation error: ${result.error.message}`);
    }

    const { name, abbreviation, teacher, totalHours } = result.data;

    const { class: response } = await ClassesController.create({
      name,
      abbreviation,
      teacher,
      totalHours,
    });

    logger.info(`Created class [${response.name}] successfully`);

    return Response.json({ class: response }, { status: 200 });
  } catch (error) {
    return apiError(error as Error);
  }
}
