import z from 'zod';

import { ClassesController } from '@/controllers/classes';
import logger from '@/logger';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  logger.info(`Fetching class with id [${id}]`);

  const { class: response } = await ClassesController.find(id);

  if (!response) {
    logger.error(`Class with id [${id}] not found`);
    return Response.json({ message: 'Class not found' }, { status: 404 });
  }

  logger.info(`Fetched class with id [${id}] successfully`);

  return Response.json({ class: response }, { status: 200 });
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const data = await request.json();

  logger.info(`Updating class with id [${id}]`);

  const updateclassSchema = z.object({
    name: z.string().optional(),
    abbreviation: z.string().optional(),
    teacher: z.string().optional(),
    totalHours: z.number().optional(),
  });

  const { name, abbreviation, teacher, totalHours } = updateclassSchema.parse(data);

  const { class: response } = await ClassesController.update(id, {
    name,
    abbreviation,
    teacher,
    totalHours,
  });

  logger.info(`Updated class with id [${id}] successfully`);

  return Response.json({ message: 'Class updated', class: response }, { status: 200 });
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  logger.info(`Deleting class with id [${id}]`);

  await ClassesController.delete(id);

  logger.info(`Deleted class with id [${id}] successfully`);

  return Response.json({ message: 'Class deleted' }, { status: 200 });
}
