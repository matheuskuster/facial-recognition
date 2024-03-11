import z from 'zod';

import { StudentAttendancesController } from '@/controllers/studentAttendances';
import { NotFoundError, ValidationError } from '@/errors';
import apiError from '@/errors/apiError';
import logger from '@/logger';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  logger.info(`Fetching student attendance with id [${id}]`);

  try {
    const { studentAttendance } = await StudentAttendancesController.find(id);

    if (!studentAttendance) {
      throw new NotFoundError(`Student attendance with id [${id}] not found`);
    }

    logger.info(`Fetched student attendance with id [${id}] successfully`);

    return Response.json({ studentAttendance }, { status: 200 });
  } catch (error) {
    return apiError(error as Error);
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const data = await request.json();

  logger.info(`Updating student attendance with id [${id}]`);

  const updateStudentSchema = z.object({
    present: z.boolean().optional(),
  });

  const result = updateStudentSchema.safeParse(data);

  try {
    if (!result.success) {
      throw new ValidationError(`Validation error: ${result.error.message}`);
    }

    const { present } = result.data;

    const { studentAttendance } = await StudentAttendancesController.update(id, { present });

    logger.info(`Updated student attendance with id [${id}] successfully`);

    return Response.json(
      { message: 'Student attendance updated', studentAttendance },
      { status: 200 },
    );
  } catch (error) {
    return apiError(error as Error);
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  logger.info(`Deleting student attendance with id [${id}]`);
  try {
    const foundStudentAttendance = await StudentAttendancesController.find(id);

    if (!foundStudentAttendance.studentAttendance) {
      throw new NotFoundError(`Student attendance with id [${id}] not found`);
    }

    await StudentAttendancesController.delete(id);

    logger.info(`Deleted student attendance with id [${id}] successfully`);

    return Response.json(
      { message: 'Student attendance deleted', studentAttendance: foundStudentAttendance },
      { status: 200 },
    );
  } catch (error) {
    return apiError(error as Error);
  }
}
