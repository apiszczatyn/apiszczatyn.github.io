document.addEventListener("DOMContentLoaded", function() {
    const peer = new Peer();
    let conn; // Referencja do połączenia tekstowego
    let mediaStream = null; // Referencja do strumienia wideo

    const myVideo = document.getElementById('my-video');
    const remoteVideo = document.getElementById('remote-video');
    const videoContainer = document.getElementById('video-container');
    const closeVideoButton = document.getElementById('close-video');

    // Przechwytywanie mediów wideo i audio
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then(stream => {
        mediaStream = stream;
        myVideo.srcObject = stream;

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

    // Otwarcie połączenia z innym peerem
    peer.on('open', id => {
        document.getElementById('my-id').value = id;
    });

    // Przyjmowanie połączeń tekstowych
    peer.on('connection', connection => {
        conn = connection;
        setupConnectionHandlers(conn);
    });

    // Funkcja do obsługi połączeń tekstowych
    function setupConnectionHandlers(conn) {
        conn.on('open', () => {
            console.log("Connection established.");
        });

        conn.on('data', data => {
            displayMessage(`Friend: ${data}`);
        });
    }

    // Wysyłanie wiadomości tekstowych
    document.getElementById('send').addEventListener('click', () => {
        const message = document.getElementById('message').value;
        if (conn) {
            conn.send(message);
            displayMessage(`Me: ${message}`);
            document.getElementById('message').value = '';
        } else {
            console.log('Connection is closed.');
        }
    });

    // Inicjalizacja połączenia wideo
    document.getElementById('connect').addEventListener('click', function() {
        const otherPeerId = document.getElementById('connect-to').value;
        if (!conn) {
            conn = peer.connect(otherPeerId);
            setupConnectionHandlers(conn);
        }

        const call = peer.call(otherPeerId, mediaStream);
        call.on('stream', remoteStream => {
            remoteVideo.srcObject = remoteStream;
            videoContainer.style.display = 'block'; // Pokazanie wideo
        });
    });

    // Zamknięcie wideo i powrót do czatu tekstowego
    closeVideoButton.addEventListener('click', () => {
        videoContainer.style.display = 'none'; // Ukrycie wideo
        if (mediaStream) {
            mediaStream.getTracks().forEach(track => track.stop()); // Zatrzymaj strumień
        }
        // Ponownie inicjuje przechwytywanie mediów
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(stream => {
            mediaStream = stream;
            myVideo.srcObject = stream;
        });
    });

    // Funkcja do wyświetlania wiadomości w oknie czatu
    function displayMessage(message) {
        const messagesDiv = document.getElementById('messages');
        const messageParagraph = document.createElement('p');
        messageParagraph.textContent = message;
        messagesDiv.appendChild(messageParagraph);
    }
});
