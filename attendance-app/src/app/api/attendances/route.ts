import z from 'zod';

import { AttendancesController } from '@/controllers/attendances';
import { ClassesController } from '@/controllers/classes';
import logger from '@/logger';

export async function GET() {
  logger.info('Fetching all attendances');

  const { attendances } = await AttendancesController.findAll();

  logger.info(`Fetched [${attendances.length}] attendances successfully`);
  return Response.json({ attendances }, { status: 200 });
}

export async function POST(request: Request) {
  const data = await request.json();

  logger.info(`Creating a new attendance for class $[${data.classId}]`);

  const createAttendanceSchema = z.object({
    classId: z.string(),
    date: z.coerce.date(),
    photoUrl: z.string().optional(),
  });

  const { classId, date, photoUrl } = createAttendanceSchema.parse(data);

  logger.info(`Searching for class with id [${classId}]`);

  const { class: foundClass } = await ClassesController.find(classId);

  if (!foundClass) {
    logger.error(`Class with id [${classId}] not found`);
    return Response.json({ message: 'Class not found' }, { status: 404 });
  }

  const { attendance } = await AttendancesController.create({ classId, date, photoUrl });

  logger.info(`Created attendance [${attendance.id}] successfully`);

  return Response.json({ attendance }, { status: 200 });
}
