import z from 'zod';

import { StudentAttendancesController } from '@/controllers/studentAttendances';
import { NotFoundError, ValidationError } from '@/errors';
import apiError from '@/errors/apiError';
import logger from '@/logger';

export async function GET() {
  logger.info('Fetching all student attendances');

  try {
    const { studentAttendances } = await StudentAttendancesController.findAll();

    if (studentAttendances.length === 0) {
      throw new NotFoundError('No student attendances found');
    }

    logger.info(`Fetched [${studentAttendances.length}] student attendances successfully`);

    return Response.json({ studentAttendances }, { status: 200 });
  } catch (error) {
    return apiError(error as Error);
  }
}

export async function POST(request: Request) {
  const body = await request.json();

  logger.info(`Recording attendance for student [${body.studentId}]`);

  const createStudentAttendanceSchema = z.object({
    studentId: z.string(),
    attendanceId: z.string(),
    present: z.boolean(),
  });

  const result = createStudentAttendanceSchema.safeParse(body);

  try {
    if (!result.success) {
      throw new ValidationError(`Validation error: ${result.error.message}`);
    }

    const { studentId, attendanceId, present } = result.data;

    const { studentAttendance } = await StudentAttendancesController.create({
      studentId,
      attendanceId,
      present,
    });

    logger.info(`Recorded attendance for student [${studentId}] successfully`);

    return Response.json({ studentAttendance }, { status: 200 });
  } catch (error) {
    return apiError(error as Error);
  }
}
