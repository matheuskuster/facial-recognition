import { NextRequest, NextResponse } from 'next/server';

import { S3Controller } from '@/controllers/s3';
import { StudentsController } from '@/controllers/students';
import logger from '@/logger';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  logger.info(`Updating picture for student with id [${id}]`);

  const { student } = await StudentsController.find(id);

  if (!student) {
    logger.error(`Student with id [${id}] not found`);
    return NextResponse.json({ message: 'Student not found' }, { status: 404 });
  }

  const formData = await request.formData();
  const file = formData.get('file') as File;

  const { url } = await S3Controller.uploadFile(file);

  const updatedStudent = await StudentsController.update(id, {
    photoUrl: url,
  });

  return Response.json({ student: updatedStudent }, { status: 200 });
}
