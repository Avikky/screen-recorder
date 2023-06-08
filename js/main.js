let stream = null,
	audio = null,
	mixedStream = null,
	chunks = [], 
	recorder = null
	startButton = null,
	stopButton = null,
	downloadButton = null,
	recordedVideo = null;

async function setupStream () {
    try {
        stream = await navigator.mediaDevices.getDisplayMedia({
            video: true
        });

        audio = await navigator.mediaDevices.getUserMedia({
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                sampleRate: 44100,
            },
        });

        setupVideoFeedback();
    } catch (err) {
        console.error(err)
    }
}

function setupVideoFeedback() {
	if (stream) {
		const video = document.querySelector('#recordingFeedback');
		video.srcObject = stream;
		video.play();
	} else {
		console.warn('No stream available');
	}
}

async function startRecording () {
    recorededVideo.style.display='none';
    const adText = document.querySelector('.add-text');
    const downloadContainer = document.querySelector('#downloadContainer');
    adText.style.display = 'block';
    downloadContainer.style.display = 'none';
  
	await setupStream();

	if (stream && audio) {
		mixedStream = new MediaStream([...stream.getTracks(), ...audio.getTracks()]);
		recorder = new MediaRecorder(mixedStream);
		recorder.ondataavailable = handleDataAvailable;
		recorder.onstop = handleStop;
		recorder.start(1000);
	
		startButton.disabled = true;
		stopButton.disabled = false;
	
		console.log('Recording started');
        let displayTitle = document.querySelector('#displayTitle').innerHTML='Recording...';
	} else {
		console.warn('No stream available.');
	}
}

function stopRecording () {
	recorder.stop();

	startButton.disabled = false;
	stopButton.disabled = true;
    let displayTitle = document.querySelector('#displayTitle').innerHTML='Video recorder';
}

function handleDataAvailable (e) {
	chunks.push(e.data);
}

function handleStop (e) {
	const blob = new Blob(chunks, { 'type' : 'video/mp4' });
	chunks = [];

	downloadButton.href = URL.createObjectURL(blob);
	downloadButton.download = 'video-record.mp4';
	downloadButton.disabled = false;
  

	recordedVideo.src = URL.createObjectURL(blob);
	recordedVideo.load();
	recordedVideo.onloadeddata = function() {
        recorededVideo.style.display='block';
        const adText = document.querySelector('.add-text');
        const downloadContainer = document.querySelector('#downloadContainer');
        adText.style.display = 'none';
        downloadContainer.style.display = 'block';
		// const rc = document.querySelector(".recorded-video-wrap");
		// rc.classList.remove("hidden");
		// rc.scrollIntoView({ behavior: "smooth", block: "start" });

		recordedVideo.play();
	}

	stream.getTracks().forEach((track) => track.stop());
	audio.getTracks().forEach((track) => track.stop());

	console.log('Recording stopped');

}


window.addEventListener('load', () => {
	startButton = document.querySelector('#startRecording');
	stopButton = document.querySelector('#stopRecording');
	downloadButton = document.querySelector('#downloadVideo');
	recordedVideo = document.querySelector('#recorededVideo');

	startButton.addEventListener('click', startRecording);
	stopButton.addEventListener('click', stopRecording);
})