from flask import Flask, request, jsonify
import os
import requests
import face_recognition
import cv2
import numpy as np

app = Flask(__name__)

def generate_presence_report(attendance_image_path, student_images):
  known_face_encodings = []
  known_face_ids = []
  for student in student_images:
    student_image_url = student.get("imageUrl")
    student_image_path = None

    if student_image_url:
      student_image_response = requests.get(student_image_url, stream=True)
      if student_image_response.status_code == 200:
        student_image_path = f"student_{student.get('id')}.jpg"
        with open(student_image_path, "wb") as f:
          for chunk in student_image_response.iter_content(1024):
            f.write(chunk)
      else:
        return f"Failed to download student image for id {student.get('id')}: {student_image_response.status_code}", 400

    if student_image_path:
      try:
        student_image = face_recognition.load_image_file(student_image_path)
        student_face_encoding = face_recognition.face_encodings(student_image)[0]
        known_face_encodings.append(student_face_encoding)
        known_face_ids.append(student.get("id"))
      except Exception as e:
        print(f"Error loading student image '{student_image_path}': {str(e)}")

  # Load attendance image
  try:
    attendance_image = face_recognition.load_image_file(attendance_image_path)
  except Exception as e:
    print(f"Error loading attendance image: {str(e)}")
    return None

  # Find faces and encodings in attendance image
  face_locations = face_recognition.face_locations(attendance_image)
  face_encodings = face_recognition.face_encodings(attendance_image, face_locations)

  # Check for presence of known faces
  presence_report = {}
  for face_encoding in face_encodings:
    matches = face_recognition.compare_faces(known_face_encodings, face_encoding)
    for i, known_face_id in enumerate(known_face_ids):
      if matches[i]:
        presence_report[known_face_id] = True
        break  # Only record presence once per student

  # Mark students not found in attendance image as absent
  for student_id in known_face_ids:
    if student_id not in presence_report:
      presence_report[student_id] = False

  # Delete attendance and student images
  for student in student_images:
    student_image_path = f"student_{student.get('id')}.jpg"
    try:
      os.remove(student_image_path)
    except Exception as e:
      print(f"Error deleting student image '{student_image_path}': {str(e)}")

  try:
    os.remove(attendance_image_path)
  except Exception as e:
    print(f"Error deleting attendance image '{attendance_image_path}': {str(e)}")

  return presence_report

@app.route("/process_image", methods=["POST"])
def process_image():
  print("Processing image")

  if request.method == "POST":
    data = request.get_json()
    attendanceId = data.get("attendanceId")
    attendanceImageUrl = data.get("attendanceImageUrl")
    students = data.get("students", [])

    downloaded_images = []

    try:
      attendance_image_response = requests.get(attendanceImageUrl, stream=True)
      if attendance_image_response.status_code == 200:
        attendance_image_filename = f"attendance_{attendanceId}.jpg"
        with open(attendance_image_filename, "wb") as f:
          for chunk in attendance_image_response.iter_content(1024):
            f.write(chunk)
        downloaded_images.append(attendance_image_filename)
      else:
        return f"Failed to download attendance image: {attendance_image_response.status_code}", 400

      # Generate presence report
      presence_report = generate_presence_report(attendance_image_filename, students)
      if presence_report is None:
        return "Error processing attendance image", 500


      # Send presence report to webhook
      WEBHOOK_URL = "http://localhost:3000/api/attendances/{attendanceId}/webhook".format(attendanceId=attendanceId)
      response = requests.post(WEBHOOK_URL, json={"attendanceId": attendanceId, "report": presence_report})

      return jsonify({"message": "Presence report generated", "presence_report": presence_report}), 200

    except Exception as e:
      return f"Error processing images: {str(e)}", 500

    return "This endpoint only accepts POST requests", 405

if __name__ == "__main__":
  app.run(port=8000, debug=True)