import z from 'zod';

import { AttendancesController } from '@/controllers/attendances';
import { ClassesController } from '@/controllers/classes';
import { NotFoundError, ValidationError } from '@/errors';
import apiError from '@/errors/apiError';
import logger from '@/logger';

export async function GET() {
  logger.info('Fetching all attendances');

  try {
    const { attendances } = await AttendancesController.findAll();

    if (!attendances) {
      throw new NotFoundError('No attendances found');
    }

    logger.info(`Fetched [${attendances.length}] attendances successfully`);

    return Response.json({ attendances }, { status: 200 });
  } catch (error) {
    return apiError(error as Error);
  }
}

export async function POST(request: Request) {
  const data = await request.json();

  logger.info(`Creating a new attendance for class $[${data.classId}]`);

  const createAttendanceSchema = z.object({
    classId: z.string(),
    date: z.coerce.date(),
    photoUrl: z.string().optional(),
  });

  const result = createAttendanceSchema.safeParse(data);

  try {
    if (!result.success) {
      throw new ValidationError(`Validation error: ${result.error.message}`);
    }

    const { classId, date, photoUrl } = result.data;

    logger.info(`Searching for class with id [${classId}]`);

    const { class: foundClass } = await ClassesController.find(classId);

    if (!foundClass) {
      throw new NotFoundError(`Class with id [${classId}] not found`);
    }

    const { attendance } = await AttendancesController.create({ classId, date, photoUrl });

    logger.info(`Created attendance [${attendance.id}] successfully`);

    return Response.json({ attendance }, { status: 200 });
  } catch (error) {
    return apiError(error as Error);
  }
}
