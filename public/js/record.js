const start = async () => {
    let audiotrack, videotrack;
    await navigator.mediaDevices.getDisplayMedia({
        video: {
            mediaSource: 'screen',
            displaySurface: 'window',
        },
        preferCurrentTab: true
    }).then((displaystream) => {
        [videotrack] = displaystream.getVideoTracks();
        navigator.mediaDevices.getUserMedia({ audio: true }).then((audiostream) => {
            [audiotrack] = audiostream.getAudioTracks();

            const data = [];

            const mediaStream = new MediaStream([videotrack, audiotrack]);
            const mediaRecorder = new MediaRecorder(mediaStream);

            mediaRecorder.ondataavailable = (e) => {
                data.push(e.data);
            };

            mediaRecorder.start();
            mediaRecorder.onstop = (e) => {
                // console.log(e);
                // console.log(data);
                document.querySelector('video').src = URL.createObjectURL(
                    new Blob(data, {
                        type: data[0].type,
                    })
                )
                document.querySelector('video').type = data[0].type;
            }
        })
    })
}