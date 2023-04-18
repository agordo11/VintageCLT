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
        console.log('dataURL:', dataURL);
        console.log('imageData:', imageData);

        $.ajax({
            url: '/video_feed',
            type: 'POST',
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

    navigator.mediaDevices.getUserMedia({video: true})
        .then(function(stream) {
            const video = document.getElementById('video');
            video.srcObject = stream;
            video.play();

            // Start checking for QR codes after the video starts playing
            video.addEventListener('canplay', checkForQRCode, false);
        })
        .catch(function(err) {
            console.error('An error occurred: ', err);
        });
}