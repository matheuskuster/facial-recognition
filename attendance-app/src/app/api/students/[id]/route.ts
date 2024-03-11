import z from 'zod';

import { StudentsController } from '@/controllers/students';
import { NotFoundError, ValidationError } from '@/errors';
import apiError from '@/errors/apiError';
import logger from '@/logger';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  logger.info(`Fetching student with id [${id}]`);

  try {
    const { student } = await StudentsController.find(id);

    if (!student) {
      throw new NotFoundError(`Student with id [${id}] not found`);
    }

    logger.info(`Fetched student with id [${id}] successfully`);

    return Response.json({ student }, { status: 200 });
  } catch (error) {
    return apiError(error as Error);
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const body = await request.json();

  logger.info(`Updating student with id [${id}]`);

  const updateStudentSchema = z.object({
    name: z.string().optional(),
    photoUrl: z.string().optional(),
  });

  const result = updateStudentSchema.safeParse(body);

  try {
    if (!result.success) {
      throw new ValidationError(`Validation error: ${result.error.message}`);
    }

    const { name, photoUrl } = result.data;

    const foundStudent = await StudentsController.find(id);

    if (!foundStudent.student) {
      throw new NotFoundError(`Student with id [${id}] not found`);
    }

    const { student } = await StudentsController.update(id, { name, photoUrl });

    logger.info(`Updated student with id [${id}] successfully`);

    return Response.json({ message: 'Student updated', student }, { status: 200 });
  } catch (error) {
    return apiError(error as Error);
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  logger.info(`Deleting student with id [${id}]`);

  try {
    const foundStudent = await StudentsController.find(id);

    if (!foundStudent.student) {
      throw new NotFoundError(`Student with id [${id}] not found`);
    }

    await StudentsController.delete(id);

    logger.info(`Deleted student with id [${id}] successfully`);

    return Response.json({ message: 'Student deleted', student: foundStudent }, { status: 200 });
  } catch (error) {
    return apiError(error as Error);
  }
}
