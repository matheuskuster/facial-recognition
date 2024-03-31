import { imageProcessingAPI } from '@/services/image-processing-api';

export class ImageProcessingController {
  static async processImage(params: {
    attendance: {
      id: string;
      photoUrl: string;
    };
    students: {
      id: string;
      photoUrl: string;
    }[];
  }) {
    const { attendance, students } = params;

    const response = await imageProcessingAPI.post('/process_image', {
      attendanceId: attendance.id,
      attendanceImageUrl: attendance.photoUrl,
      students: students.map((student) => ({
        id: student.id,
        imageUrl: student.photoUrl,
      })),
    });

    return response.data;
  }
}
