document.addEventListener("DOMContentLoaded", function() {
    const peer = new Peer();
    let conn; // Keep connection reference for reuse
    let connections = []; // Array to track active connections


    peer.on('open', id => {
        document.getElementById('my-id').value = `${id}`;
    });

    document.getElementById('connect').addEventListener('click', function() {
        if (connections.length >= 1) {
            displayMessage("Cannot connect: You can't connect to more than one user.");
            return;
        }
        const connectToId = document.getElementById('connect-to').value;
        conn = peer.connect(connectToId);
        setupConnectionHandlers(conn);
    });


    peer.on('connection', connection => {
        if (connections.length >= 1) {
            console.log('Incoming connection from', connection.peer, 'rejected: Limit of two connections reached');
            connection.close();
            return;
        }
        conn = connection;
        setupConnectionHandlers(conn);
    });

    function setupConnectionHandlers(conn) {
        if (connections.length >= 1) {
            console.log('Cannot setup connection: Limit of two connections reached');
            displayMessage("Cannot setup connection: Limit of two connections reached");
            conn.close();
            return;
        }
        connections.push(conn);
        updateActiveConnections();

        conn.on('open', () => {
            console.log("Connection established with", conn.peer);
        });

        conn.on('data', data => {
            if (data instanceof ArrayBuffer) {
                displayFile(data);
            } else {
                displayMessage(`Friend: ${data}`);
            }
        });

        conn.on('close', () => {
            connections = connections.filter(c => c !== conn);
            updateActiveConnections();
            console.log('Connection closed with', conn.peer);
        });

        conn.on('error', err => {
            connections = connections.filter(c => c !== conn);
            updateActiveConnections();
            console.error('Connection error with', conn.peer, ':', err);
        });
    }

    document.getElementById('send').addEventListener('click', () => sendMessage(conn));
    document.getElementById('sendFile').addEventListener('click', () => sendFile(conn));

    function sendMessage(conn) {
        const message = document.getElementById('message').value;
        if (conn && conn.open) {
            conn.send(message);
            displayMessage(`Me: ${message}`);
            clearInput('message');
        } else {
            console.log('Connection is closed.');
        }
    }

    function sendFile(conn) {
        const file = document.getElementById('file').files[0];
        if (file && conn && conn.open) {
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



    function updateActiveConnections() {
        const activeConnectionsDiv = document.getElementById('active-connections');
        activeConnectionsDiv.innerHTML = ''; // Clear existing connections

        connections.forEach((conn, index) => {
            const connParagraph = document.createElement('p');
            connParagraph.textContent = `Connection ${index + 1}: ${conn.peer}`;
            activeConnectionsDiv.appendChild(connParagraph);
        });
    }

    document.getElementById('copy').addEventListener('click', copyButton);

    function copyButton() {
        var copyText = document.getElementById("my-id");
        copyText.select();
        copyText.setSelectionRange(0, 99999);
        navigator.clipboard.writeText(copyText.value);
    }

    var enterButton = document.getElementById('enterButton');
    var welcomeOverlay = document.getElementById('welcomePage');
    var chatPage = document.getElementById('chatPage');
    var videoPage = document.getElementById('videoChatPage')

    var myVideo = document.getElementById('my-video');
    var remoteVideo = document.getElementById('remote-video');
    var connectButton = document.getElementById('connect-button');
    var closeButton = document.getElementById('closeCall')

    enterButton.addEventListener('click', function () {
        welcomeOverlay.classList.add('hidden');
        chatPage.classList.remove('hidden');
        videoPage.classList.add('hidden');
    });
    enterVideoChat.addEventListener('click', function (){
        chatPage.classList.add('hidden');
        videoPage.classList.remove('hidden');
        welcomeOverlay.classList.add('hidden');
        startVideoStream();
    });

    function startVideoStream() {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(stream => {
            localStream = stream; // Save the local stream for re-use
            document.getElementById('my-video').srcObject = stream; // Display local video
        })
        .catch(error => {
            console.error('Nie udało się uzyskać dostępu do kamery: ', error);
        });
    }

    connectButton.addEventListener('click', () => {
        const call = peer.call(document.getElementById('connect-to').value, localStream);
        call.on('stream', remoteStream => {
            remoteVideo.srcObject = remoteStream;
        });
    });

    peer.on('call', call => {
        call.answer(localStream);
        call.on('stream', remoteStream => {
            remoteVideo.srcObject = remoteStream;
        });
    })
    closeButton.addEventListener('click',function(){
        
        videoPage.classList.add('hidden');
        chatPage.classList.remove('hidden');
        if (localStream) {
            localStream.getTracks().forEach(track => {
                if (track.kind === 'video' || track.kind === 'audio') {
                    track.stop(); // Stop the video and audio tracks only
                }
            });
        }
        document.getElementById('remote-video').srcObject = null;
        document.getElementById('my-video').srcObject = null;

    });

   
});
