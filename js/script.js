document.addEventListener("DOMContentLoaded", function () {
  const startRecordingButton = document.getElementById("startRecording");
  const stopRecordingButton = document.getElementById("stopRecording");
  const screenRecorder = document.getElementById("screenRecorder");
  const userVideo = document.getElementById("userVideo");
  const toggleUserVideoCheckbox = document.getElementById("toggleUserVideo");

  let mediaStream, userMediaStream, mediaRecorder;

  let recordedChunks = [];

  // start recording function
  async function startRecording() {
    try {
      recordedChunks = [];

      if (screenRecorder.src) {
        URL.revokeObjectURL(screenRecorder.src);
      }

      const screenMedia = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });

      const audioStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        echoCancellation: true,
        noiseSuppression: true,
        sampleRate: 44100,
        suppressionLocalAudioPlayback: true,
      });

      userMediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });

      userMediaStream.srcObject = userMediaStream;

      mediaStream = new MediaStream([
        ...screenMedia.getTracks(),
        ...audioStream.getTracks(),
      ]);

      mediaRecorder = new MediaRecorder(mediaStream, {
        mimeType: "video/webm",
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunks, {
          type: "video/webm",
        });
        const url = URL.createObjectURL(blob);
        screenRecorder.src = url;
      };

      // stop recording when screen share is stopped
      mediaStream.getVideoTracks()[0].onended = () => {
        stopRecording();
      };

      mediaRecorder.start();
      startRecordingButton.disabled = true;
      stopRecordingButton.disabled = false;

      if (!toggleUserVideoCheckbox.checked) {
        userVideo.style.display = "none";
      }
    } catch (error) {
      console.log("Error starting recording: ", error);
    }
  }

  // stop recording function
  function stopRecording() {
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.stop();
      mediaStream.getTracks().forEach((track) => track.stop());
      userMediaStream.getTracks().forEach((track) => track.stop());
      startRecordingButton.disabled = false;
      stopRecordingButton.disabled = true;
      screenRecorder.style.display = "block";
      userVideo.style.display = "none";
    }
  }

  function toggleUserVideo() {
    userVideo.style.display = toggleUserVideoCheckbox.checked
      ? "block"
      : "none";
  }

  startRecordingButton.addEventListener("click", startRecording);
  stopRecordingButton.addEventListener("click", stopRecording);
  toggleUserVideoCheckbox.addEventListener("change", toggleUserVideo);
});
