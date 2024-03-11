import z from 'zod';

import { ClassesController } from '@/controllers/classes';
import { NotFoundError, ValidationError } from '@/errors';
import apiError from '@/errors/apiError';
import logger from '@/logger';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  logger.info(`Fetching class with id [${id}]`);

  try {
    const { class: response } = await ClassesController.find(id);

    if (!response) {
      throw new NotFoundError(`Class with id [${id}] not found`);
    }

    logger.info(`Fetched class with id [${id}] successfully`);

    return Response.json({ class: response }, { status: 200 });
  } catch (error) {
    return apiError(error as Error);
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const body = await request.json();

  logger.info(`Updating class with id [${id}]`);

  const updateclassSchema = z.object({
    name: z.string().optional(),
    abbreviation: z.string().optional(),
    teacher: z.string().optional(),
    totalHours: z.number().optional(),
  });

  const result = updateclassSchema.safeParse(body);

  try {
    if (!result.success) {
      throw new ValidationError(`Validation error: ${result.error.message}`);
    }

    const { name, abbreviation, teacher, totalHours } = result.data;

    const foundClass = await ClassesController.find(id);

    if (!foundClass.class) {
      throw new NotFoundError(`Class with id [${id}] not found`);
    }

    const { class: response } = await ClassesController.update(id, {
      name,
      abbreviation,
      teacher,
      totalHours,
    });

    logger.info(`Updated class with id [${id}] successfully`);

    return Response.json({ message: 'Class updated', class: response }, { status: 200 });
  } catch (error) {
    return apiError(error as Error);
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  logger.info(`Deleting class with id [${id}]`);

  try {
    const foundClass = await ClassesController.find(id);

    if (!foundClass.class) {
      throw new NotFoundError(`Class with id [${id}] not found`);
    }

    await ClassesController.delete(id);

    logger.info(`Deleted class with id [${id}] successfully`);

    return Response.json({ message: 'Class deleted', class: foundClass }, { status: 200 });
  } catch (error) {
    return apiError(error as Error);
  }
}
