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

    video.addEventListener('timeupdate', async () => {
        const tempCanvas = document.createElement('canvas');
        const tempContext = tempCanvas.getContext('2d');
        tempCanvas.width = video.videoWidth;
        tempCanvas.height = video.videoHeight;
        tempContext.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);
        const frameData = tempContext.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        context.putImageData(frameData, 0, 0);

        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg'));
        const response = await fetch('/video_feed', { method: 'POST', body: blob });
        const processedImage = await response.blob();
        const processedUrl = URL.createObjectURL(processedImage);
        document.getElementById('processed').src = processedUrl;
        //alert(response.json());
    });
}