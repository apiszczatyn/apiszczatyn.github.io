
document.addEventListener("DOMContentLoaded", function() {
    const peer = new Peer();

    peer.on('open', id => {
        document.getElementById('my-id').value = `${id}`;
    });

    let conn; // Keep connection reference for reuse

    document.getElementById('connect').addEventListener('click', function() {
        const connectToId = document.getElementById('connect-to').value;
        conn = peer.connect(connectToId);
        setupConnectionHandlers();
    });

    peer.on('connection', connection => {
        conn = connection;
        setupConnectionHandlers();
    });

    function setupConnectionHandlers() {
        conn.on('open', () => {
            document.getElementById('send').addEventListener('click', sendMessage);
            document.getElementById('sendFile').addEventListener('click', sendFile);
        });

        conn.on('data', data => {
            if (data instanceof ArrayBuffer) {
                displayFile(data);
            } else {
                displayMessage(`Friend: ${data}`);
            }
        });
    }

    function sendMessage() {
        const message = document.getElementById('message').value;
        conn.send(message);
        displayMessage(`Me: ${message}`);
        clearInput('message');
    }

    function sendFile() {
        const file = document.getElementById('file').files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                const buffer = event.target.result;
                conn.send(buffer);
                displayMessage(`Me: Sent a file (${file.name})`);
            };
            reader.readAsArrayBuffer(file);
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

    function copyButton() {
        var copyText = document.getElementById("my-id");
        copyText.select();
        copyText.setSelectionRange(0, 99999);
        navigator.clipboard.writeText(copyText.value);
    }

    document.getElementById('copy').addEventListener('click', copyButton);
});
