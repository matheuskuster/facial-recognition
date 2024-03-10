import z from "zod";

import { StudentsController } from "@/controllers/students";
import logger from "@/logger";

export async function GET() {
  logger.info("Fetching all students");

  const { students } = await StudentsController.findALl();

  logger.info(`Fetched [${students.length}] students successfully`);
  
  return Response.json({ students }, { status: 200 });
}

export async function POST(request: Request) {
  const data = await request.json();

  logger.info(`Creating a new student with registration [${data.registration}]`);

  const createStudentSchema = z.object({
    name: z.string(), 
    registration: z.string(),
    photoUrl: z.string(),
  })

  const { name, photoUrl, registration } = createStudentSchema.parse(data);

  const { student } = await StudentsController.create({ name, photoUrl, registration });

  logger.info(`Created student with registration [${registration}] successfully`);
  
  return Response.json({ student }, { status: 200 });
}

