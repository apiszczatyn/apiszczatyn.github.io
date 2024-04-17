document.addEventListener("DOMContentLoaded", function() {
    const firebaseConfig = {
        apiKey: "Your-API-Key", // Uzupełnij swoje dane
        authDomain: "Your-Project-ID.firebaseapp.com",
        projectId: "Your-Project-ID"
    };

    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();
    const peer = new Peer();

    let myId = null;
    let myNickname = null;
    let conn = null;

    peer.on('open', id => {
        myId = id;
    });

    document.getElementById('enter').addEventListener('click', function() {
        myNickname = document.getElementById('nickname').value;
        if (!myNickname) {
            alert("Please enter a nickname.");
            return;
        }
        db.collection("users").doc(myNickname).get().then(doc => {
            if (doc.exists) {
                alert("Nickname verified, you can now connect.");
            } else {
                db.collection("users").doc(myNickname).set({
                    peerId: myId
                }).then(() => {
                    alert("Nickname registered.");
                }).catch(error => {
                    console.error("Error registering nickname: ", error);
                });
            }
        }).catch(error => {
            console.error("Error checking nickname: ", error);
        });
    });

    document.getElementById('connect').addEventListener('click', function() {
        const connectNick = document.getElementById('connect-nick').value;
        db.collection("users").doc(connectNick).get().then(doc => {
            if (doc.exists) {
                const peerId = doc.data().peerId;
                conn = peer.connect(peerId);
                conn.on('open', () => {
                    document.getElementById('send').addEventListener('click', sendMessage);
                });

                conn.on('data', data => {
                    displayMessage(`Friend: ${data}`);
                });
            } else {
                alert("Nickname not found.");
            }
        }).catch(error => {
            console.error("Error connecting to nickname: ", error);
        });
    });

    function sendMessage() {
        const message = document.getElementById('message').value;
        if (conn && message) {
            conn.send(message);
            displayMessage(`Me: ${message}`);
            document.getElementById('message').value = '';
        }
    }

    function displayMessage(message) {
        const messagesDiv = document.getElementById('messages');
        const messageParagraph = document.createElement('p');
        messageParagraph.textContent = message;
        messagesDiv.appendChild(messageParagraph);
    }
});
