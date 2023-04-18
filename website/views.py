import base64
import io
import json
from pyzbar.pyzbar import decode
import cv2
import numpy as np
from flask import Flask, request, jsonify, Blueprint, render_template, Response

views = Blueprint('views', __name__)


@views.route('/', methods=['GET', 'POST'])
def home():
    return render_template('home.html')


@views.route('/video_feed', methods=['POST'])
def video_feed():
    cap = cv2.VideoCapture(0)
    #cool
    while True:
        success, frame = cap.read()
        if not success:
            break
        codes = decode(frame)
        print(codes)
        # Flip the frame vertically
        flipped_frame = cv2.flip(frame, 0)

        # Encode the processed frame to JPEG format
        ret, buffer = cv2.imencode('.jpg', flipped_frame)

        # Convert the buffer to bytes and yield as a frame
        return Response(buffer.tobytes(), content_type='image/jpeg')


@views.route('/scan', methods=['POST'])
def scan_qr_code():
    # Get image data from the request
    image_data = request.form['image']
    image_data = base64.b64decode(image_data)

    # Convert image data to a numpy array
    np_arr = np.frombuffer(image_data, np.uint8)

    # Decode the image and find QR codes
    image = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    codes = decode(image)

    # Extract the decoded data
    decoded_data = []
    for code in codes:
        decoded_data.append(code.data.decode('utf-8'))

    return jsonify('success')



@views.route('/process_frame', methods=['POST'])
def process_frame():
    # Receive and decode the frame
    frame_data = request.data
    nparr = np.frombuffer(frame_data, np.uint8)
    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    # Process the frame (e.g., convert to grayscale)
    gray_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    # Encode the processed frame
    ret, buffer = cv2.imencode('.jpg', gray_frame)

    # Return the processed frame
    return Response(buffer.tobytes(), content_type='image/jpeg')
