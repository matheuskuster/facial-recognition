import { NextRequest } from 'next/server';

import { S3Controller } from '@/controllers/s3';
import { StudentsController } from '@/controllers/students';
import { NotFoundError } from '@/errors';
import apiError from '@/errors/apiError';
import logger from '@/logger';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  logger.info(`Updating picture for student with id [${id}]`);

  try {
    const { student } = await StudentsController.find(id);

    if (!student) {
      throw new NotFoundError(`Student with id [${id}] not found`);
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    const { url } = await S3Controller.uploadFile(file);

    const updatedStudent = await StudentsController.update(id, {
      photoUrl: url,
    });

    return Response.json({ student: updatedStudent }, { status: 200 });
  } catch (error) {
    return apiError(error as Error);
  }
}
