import z from 'zod';

import { AttendancesController } from '@/controllers/attendances';
import { ClassesController } from '@/controllers/classes';
import { S3Controller } from '@/controllers/s3';
import { NotFoundError, ValidationError } from '@/errors';
import apiError from '@/errors/apiError';
import logger from '@/logger';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  logger.info(`Fetching attendance with id [${id}]`);

  try {
    const { attendance } = await AttendancesController.find(id);

    if (!attendance) {
      throw new NotFoundError(`Attendance with id [${id}] not found`);
    }

    logger.info(`Fetched attendance with id [${id}] successfully`);

    return Response.json({ attendance }, { status: 200 });
  } catch (error) {
    return apiError(error as Error);
  }
}

export async function POST(request: Request) {
  const body = await request.formData();

  const createAttendanceSchema = z.object({
    classId: z.string(),
    file: z.instanceof(File),
  });

  const result = createAttendanceSchema.safeParse({
    classId: body.get('classId'),
    file: body.get('file'),
  });

  try {
    if (!result.success) {
      throw new ValidationError(`Validation error: ${result.error.message}`);
    }

    logger.info(`Creating a new attendance for class [${result.data.classId}]`);

    const foundClass = await ClassesController.find(result.data.classId);

    if (!foundClass.class) {
      throw new NotFoundError(`Class with id [${result.data.classId}] not found`);
    }

    const { url } = await S3Controller.uploadFile(result.data.file);

    const { attendance } = await AttendancesController.create({
      classId: result.data.classId,
      date: new Date(),
      photoUrl: url,
      status: 'pending',
    });

    logger.info(`Created attendance for class [${result.data.classId}] successfully`);

    return Response.json({ attendance }, { status: 200 });
  } catch (error) {
    return apiError(error as Error);
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const body = await request.json();

  logger.info(`Updating attendance with id [${id}]`);

  const updateAttendanceSchema = z.object({
    photoUrl: z.string().optional(),
  });

  const result = updateAttendanceSchema.safeParse(body);

  try {
    if (!result.success) {
      throw new ValidationError(`Validation error: ${result.error.message}`);
    }

    const { photoUrl } = result.data;

    const foundAttendance = await AttendancesController.find(id);

    if (!foundAttendance.attendance) {
      throw new NotFoundError(`Attendance with id [${id}] not found`);
    }

    const { attendance } = await AttendancesController.update(id, { photoUrl });

    logger.info(`Updated attendance with id [${id}] successfully`);

    return Response.json({ message: 'Attendance updated', attendance }, { status: 200 });
  } catch (error) {
    return apiError(error as Error);
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  logger.info(`Deleting attendance with id [${id}]`);

  try {
    const foundAttendance = await AttendancesController.find(id);

    if (!foundAttendance.attendance) {
      throw new NotFoundError(`Attendance with id [${id}] not found`);
    }

    await AttendancesController.delete(id);

    logger.info(`Deleted attendance with id [${id}] successfully`);

    return Response.json({ message: 'Attendance deleted' }, { status: 200 });
  } catch (error) {
    return apiError(error as Error);
  }
}
