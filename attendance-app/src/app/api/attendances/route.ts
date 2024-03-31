import { DateTime } from 'luxon';
import z from 'zod';

import { AttendancesController } from '@/controllers/attendances';
import { ClassesController } from '@/controllers/classes';
import { ImageProcessingController } from '@/controllers/imageProcessing';
import { S3Controller } from '@/controllers/s3';
import { StudentsController } from '@/controllers/students';
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
  const data = await request.formData();

  logger.info(`Creating a new attendance for class $[${data.get('classId')}]`);

  const createAttendanceSchema = z.object({
    classId: z.string(),
    date: z.string(),
    photo: z.instanceof(File),
  });

  const result = createAttendanceSchema.safeParse({
    classId: data.get('classId'),
    date: data.get('date'),
    photo: data.get('photo'),
  });

  try {
    if (!result.success) {
      throw new ValidationError(`Validation error: ${result.error.message}`);
    }

    const { classId, date, photo } = result.data;

    logger.info(`Searching for class with id [${classId}]`);

    const { class: foundClass } = await ClassesController.find(classId);

    if (!foundClass) {
      throw new NotFoundError(`Class with id [${classId}] not found`);
    }

    const { url } = await S3Controller.uploadFile(photo);

    const { attendance } = await AttendancesController.create({
      classId,
      date: DateTime.fromISO(date).toJSDate(),
      photoUrl: url,
      status: 'pending',
    });

    logger.info(`Created attendance [${attendance.id}] successfully`);

    const students = await StudentsController.findByClassId(classId);

    ImageProcessingController.processImage({
      attendance: {
        id: attendance.id,
        photoUrl: url,
      },
      students: students.map((student) => ({
        id: student.id,
        photoUrl: student.photoUrl,
      })),
    });

    return Response.json({ attendance }, { status: 200 });
  } catch (error) {
    return apiError(error as Error);
  }
}
