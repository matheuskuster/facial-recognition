import z from 'zod';

import { StudentAttendancesController } from '@/controllers/studentAttendances';
import logger from '@/logger';

export async function GET() {
  logger.info('Fetching all student attendances');

  const { studentAttendances } = await StudentAttendancesController.findAll();

  logger.info(`Fetched [${studentAttendances.length}] student attendances successfully`);

  return Response.json({ studentAttendances }, { status: 200 });
}

export async function POST(request: Request) {
  const data = await request.json();

  logger.info(`Recording attendance for student [${data.studentId}]`);

  const createStudentAttendanceSchema = z.object({
    studentId: z.string(),
    attendanceId: z.string(),
    present: z.boolean(),
  });

  const { studentId, attendanceId, present } = createStudentAttendanceSchema.parse(data);

  const { studentAttendance } = await StudentAttendancesController.create({
    studentId,
    attendanceId,
    present,
  });

  logger.info(`Recorded attendance for student [${studentId}] successfully`);

  return Response.json({ studentAttendance }, { status: 200 });
}
