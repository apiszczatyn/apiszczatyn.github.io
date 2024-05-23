document.addEventListener("DOMContentLoaded", function() {
    const peer = new Peer();
    let conn; // Keep connection reference for reuse

    peer.on('open', id => {
        console.log('My peer ID is: ', id);
        document.getElementById('my-id').value =`${id}`;
    });

    document.getElementById('connect').addEventListener('click', function() {
        const connectToId = document.getElementById('connect-to').value;
        conn = peer.connect(connectToId);
        setupConnectionHandlers(conn);
    });

    peer.on('connection', connection => {
        conn = connection;
        setupConnectionHandlers(conn);
    });

    function setupConnectionHandlers(conn) {
        conn.on('open', () => {
            console.log("Connection established.");
        });

        conn.on('data', data => {
            if (data instanceof ArrayBuffer) {
                displayFile(data);
            } else {
                displayMessage(`Friend: ${data}`);
            }
        });
    }

    document.getElementById('send').addEventListener('click', () => sendMessage(conn));
    document.getElementById('sendFile').addEventListener('click', () => sendFile(conn));

    function sendMessage(conn) {
        const message = document.getElementById('message').value;
        if (conn) {
            conn.send(message);
            displayMessage(`Me: ${message}`);
            clearInput('message');
        } else {
            console.log('Connection is closed.');
        }
    }

    function sendFile(conn) {
        const file = document.getElementById('file').files[0];
        if (file && conn ) {
            const reader = new FileReader();
            reader.onload = function(event) {
                const buffer = event.target.result;
                conn.send(buffer);
                displayMessage(`Me: Sent a file (${file.name})`);
            };
            reader.readAsArrayBuffer(file);
        } else {
            console.log('No file selected or connection is closed.');
        }
    }

    function displayFile(buffer) {
        const blob = new Blob([buffer], {type: "application/octet-stream"});
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.textContent = 'Download File';
        anchor.download = 'received_file';
        document.getElementById('messages').appendChild(anchor);
    }

    function displayMessage(message) {
        const messagesDiv = document.getElementById('messages');
        const messageParagraph = document.createElement('p');
        messageParagraph.textContent = message;
        messagesDiv.appendChild(messageParagraph);
    }

    function clearInput(inputId) {
        document.getElementById(inputId).value = '';
    }

    
    document.getElementById('copy').addEventListener('click', copyButton);
    


    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then(stream => {
        const localVideo = document.getElementById('local-video');
        localVideo.srcObject = stream;

        // Listen for incoming calls
        peer.on('call', call => {
            console.log('Received call from:', call.peer);
            call.answer(stream); // Answer the call with our stream.
            call.on('stream', remoteStream => {
                console.log('Received remote stream');
                const remoteVideo = document.getElementById('remote-video');
                remoteVideo.srcObject = remoteStream;
            });
        });

        // Connect to other peer and start a call
        document.getElementById('connect').addEventListener('click', () => {
            const otherPeerId = document.getElementById('connect-to').value;
            console.log('Calling peer:', otherPeerId);
            const call = peer.call(otherPeerId, stream);
            call.on('stream', remoteStream => {
                console.log('Received remote stream from call');
                const remoteVideo = document.getElementById('remote-video');
                remoteVideo.srcObject = remoteStream;
            });
        });
    })
    .catch(error => {
        console.error('Error accessing media devices:', error);
    });
    

    function copyButton() {
        var copyText = document.getElementById("my-id");
        copyText.select();
        copyText.setSelectionRange(0, 99999);
        navigator.clipboard.writeText(copyText.value);
    }
});
