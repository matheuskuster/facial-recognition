import z from 'zod';

import { AttendancesController } from '@/controllers/attendances';
import { StudentAttendancesController } from '@/controllers/studentAttendances';
import { NotFoundError, ValidationError } from '@/errors';
import apiError from '@/errors/apiError';
import logger from '@/logger';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  const schema = z.object({
    report: z.record(z.boolean()),
  });

  logger.info(`Received webhook for attendance [${id}]`);

  const body = await request.json();
  const result = schema.safeParse(body);

  try {
    if (!result.success) {
      throw new ValidationError(`Validation error: ${result.error.message}`);
    }

    const { attendance } = await AttendancesController.find(id);

    if (!attendance) {
      throw new NotFoundError(`Attendance with id [${id}] not found`);
    }

    const { report } = result.data;

    await StudentAttendancesController.processReport(id, report);
    await AttendancesController.update(id, { status: 'processed' });

    return Response.json({ attendance }, { status: 200 });
  } catch (error) {
    return apiError(error as Error);
  }
}
