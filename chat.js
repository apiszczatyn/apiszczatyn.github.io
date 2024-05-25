document.addEventListener("DOMContentLoaded", function() {
    const peer = new Peer();
    let conn; // Keep connection reference for reuse

    var enterButton = document.getElementById('enterButton');
    var welcomeOverlay = document.getElementById('welcomePage');
    var chatPage = document.getElementById('chatPage');

    enterButton.addEventListener('click', function () {
        welcomeOverlay.classList.add('hidden');
        chatPage.classList.remove('hidden');
    });

    document.getElementById('go-to-video-chat').addEventListener('click', function() {
        window.location.href = 'video_chat.html'; // Path to the video chat page
    });

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

    

    function copyButton() {
        var copyText = document.getElementById("my-id");
        copyText.select();
        copyText.setSelectionRange(0, 99999);
        navigator.clipboard.writeText(copyText.value);
    }

    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then(stream => {
        document.getElementById('local-video').srcObject = stream;

        peer.on('call', call => {
            call.answer(stream); // Odpowiedz na przychodzące połączenie wideo
            call.on('stream', remoteStream => {
                document.getElementById('remote-video').srcObject = remoteStream;
            });
        });

        document.getElementById('connect').addEventListener('click', function() {
            const otherPeerId = document.getElementById('connect-to').value;
            const call = peer.call(otherPeerId, stream); // Rozpocznij połączenie wideo
            call.on('stream', remoteStream => {
                document.getElementById('remote-video').srcObject = remoteStream;
            });
        });
    })
    .catch(error => {
        console.error('Error accessing media devices:', error);
    });

    
});
