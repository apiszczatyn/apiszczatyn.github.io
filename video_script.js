const myVideo = document.getElementById('my-video');
const remoteVideo = document.getElementById('remote-video');
const myIdDisplay = document.getElementById('my-id');
const remoteIdInput = document.getElementById('remote-id');
const connectButton = document.getElementById('connect-button');

navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then(stream => {
        myVideo.srcObject = stream;

        const peer = new Peer()

        peer.on('open', id => {
            myIdDisplay.textContent = id;
        });

        connectButton.addEventListener('click', () => {
            const call = peer.call(remoteIdInput.value, stream);
            call.on('stream', remoteStream => {
                remoteVideo.srcObject = remoteStream;
            });
        });

        peer.on('call', call => {
            call.answer(stream);
            call.on('stream', remoteStream => {
                remoteVideo.srcObject = remoteStream;
            });
        });
    })
    .catch(error => {
        console.error('Nie udało się uzyskać dostępu do kamery: ', error);
    });
