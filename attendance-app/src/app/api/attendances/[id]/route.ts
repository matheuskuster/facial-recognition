import z from 'zod';

import { AttendancesController } from '@/controllers/attendances';
import logger from '@/logger';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  logger.info(`Fetching attendance with id [${id}]`);

  const { attendance } = await AttendancesController.find(id);

  if (!attendance) {
    logger.error(`Attendance with id [${id}] not found`);
    return Response.json({ message: 'Attendance not found' }, { status: 404 });
  }

  logger.info(`Fetched attendance with id [${id}] successfully`);
  return Response.json({ attendance }, { status: 200 });
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const data = await request.json();

  logger.info(`Updating attendance with id [${id}]`);

  const updateAttendanceSchema = z.object({
    photoUrl: z.string().optional(),
  });

  const { photoUrl } = updateAttendanceSchema.parse(data);

  const { attendance } = await AttendancesController.update(id, { photoUrl });

  logger.info(`Updated attendance with id [${id}] successfully`);
  return Response.json({ message: 'Attendance updated', attendance }, { status: 200 });
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  logger.info(`Deleting attendance with id [${id}]`);

  await AttendancesController.delete(id);

  logger.info(`Deleted attendance with id [${id}] successfully`);
  return Response.json({ message: 'Attendance deleted' }, { status: 200 });
}
