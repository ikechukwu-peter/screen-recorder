document.addEventListener("DOMContentLoaded", () => {
  const startRecordingButton = document.getElementById("startRecording");
  const stopRecordingButton = document.getElementById("stopRecording");
  const screenRecorder = document.getElementById("screenRecorder");
  const userVideo = document.getElementById("userVideo");
  const toggleUserVideoCheckbox = document.getElementById("toggleUserVideo");

  let mediaStream;
  let userMediaStream;
  let mediaRecorder;
  let recordedChunks = [];

  async function startRecording() {
    try {
      recordedChunks = [];
      if (screenRecorder.src) {
        URL.revokeObjectURL(screenRecorder.src);
      }

      screenRecorder.style.display = "none";

      const videoStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });
      const audioStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        echoCancellation: true,
        noiseSuppression: true,
        sampleRate: 44100,
        suppressLocalAudioPlayback: true,
      });

      userMediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });

      userVideo.srcObject = userMediaStream;

      mediaStream = new MediaStream([
        ...videoStream.getTracks(),
        ...audioStream.getTracks(),
      ]);
      mediaRecorder = new MediaRecorder(mediaStream);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        screenRecorder.src = url;
      };

      mediaStream.getVideoTracks()[0].addEventListener("ended", () => {
        stopRecording();
      });

      mediaRecorder.start();
      startRecordingButton.disabled = true;
      stopRecordingButton.disabled = false;
      if (!toggleUserVideoCheckbox.checked) {
        userVideo.style.display = "none";
      }
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  }

  function stopRecording() {
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.stop();
      mediaStream.getTracks().forEach((track) => track.stop()); // Stop screen stream
      userMediaStream.getTracks().forEach((track) => track.stop()); // Stop user's video stream
      startRecordingButton.disabled = false;
      stopRecordingButton.disabled = true;
      screenRecorder.style.display = "block";
      userVideo.style.display = "none";
    }
  }

  function toggleUserVideo() {
    console.log("toggleUserVideo", toggleUserVideoCheckbox.checked);
    userVideo.style.display = toggleUserVideoCheckbox.checked
      ? "block"
      : "none";
  }

  startRecordingButton.addEventListener("click", startRecording);
  stopRecordingButton.addEventListener("click", stopRecording);
  toggleUserVideoCheckbox.addEventListener("change", toggleUserVideo);
});
