async function startVideo() {
    const video = document.getElementById('video');
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    const constraints = { video: { width: 640, height: 480 } };
    const stream = await navigator.mediaDevices.getUserMedia(constraints);

    video.srcObject = stream;
    video.play();

    video.addEventListener('loadedmetadata', () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
    });

    function checkForQRCode() {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataURL = canvas.toDataURL('image/jpeg');
        const imageData = dataURL.split(',')[1];

        $.ajax({
            url: '/video_feed',
            type: 'POST',
            data: JSON.stringify({ image: imageData }),
            contentType: 'application/json',
            success: function(response) {
                if (response.found_qr_code) {
                    // Extract the QR code information
                    let qrInfo = response.qr_data;

                    // Display the QR code information in the modal
                    $('#qrInfo').text(qrInfo);

                    // Show the modal
                    $('#qrModal').modal('show');
                } else {
                    // Retry after a delay if no QR code is found
                    setTimeout(checkForQRCode, 1000);
                }
            },
            error: function() {
                // Retry after a delay in case of an error
                setTimeout(checkForQRCode, 1000);
            }
        });
    }

    // Start checking for QR codes after the video starts playing
    video.addEventListener('canplay', checkForQRCode, false);
}

startVideo(); // Call startVideo() to initialize the video stream and QR code checking
