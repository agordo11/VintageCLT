import base64
import io
import json
from pyzbar.pyzbar import decode
import cv2
import numpy as np
from flask import Flask, request, jsonify, Blueprint, render_template, Response, make_response
import base64

views = Blueprint('views', __name__)


@views.route('/', methods=['GET', 'POST'])
def home():
    return render_template('home.html')


@views.route('/video_feed', methods=['POST'])
def video_feed():
    try:
        # Decode the base64-encoded image
        image_data = base64.b64decode(request.json['image'])

        # Convert the image data to a NumPy array and decode it into an OpenCV frame
        image_array = np.frombuffer(image_data, dtype=np.uint8)
        frame = cv2.imdecode(image_array, cv2.IMREAD_COLOR)

        codes = decode(frame)
        if codes:
            print("QR code(s) found:", codes)
            return jsonify({"found_qr_code": True, "qr_data": str(codes[0].data)})
        else:
            print("No QR code found")
            return jsonify({"found_qr_code": False})

    except Exception as e:
        print("Error:", e)
        return make_response(jsonify({"error": str(e)}), 400)


