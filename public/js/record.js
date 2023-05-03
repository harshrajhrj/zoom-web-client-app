const start = async (meetID) => {
    const media = await navigator.mediaDevices.getDisplayMedia({
        video: {
            mediaSource: 'screen',
            displaySurface: 'window',
        },
        preferCurrentTab: true
    })
    const data = [];

    const mediaRecorder = new MediaRecorder(media);

    mediaRecorder.ondataavailable = (e) => {
        data.push(e.data);
    };

    mediaRecorder.start();
    mediaRecorder.onstop = (e) => {
        document.querySelector('video').src = URL.createObjectURL(
            new Blob(data, {
                type: data[0].type,
            })
        )
        const form = new FormData();
        form.append('file', new Blob(data, {
            type: data[0].type,
        }));
        form.append('meetID', meetID);
        fetch('/user/meeting/upload', {
            method: 'POST',
            // headers: {
            //     'Content-Type': 'multipart/form-data'
            // },
            body: form
        })
        // document.querySelector('video').type = data[0].type;
    }
}