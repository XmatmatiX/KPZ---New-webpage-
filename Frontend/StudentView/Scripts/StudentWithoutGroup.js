document.addEventListener('DOMContentLoaded', function() {
    const createGroupButton = document.querySelector('.create-btn');
    const joinGroupButton = document.querySelector('.join-btn');
    const modal = document.getElementById('joinGroupModal');
    const closeModal = document.querySelector('.close');

    // Funkcja do tworzenia nowej grupy
    function createGroup() {
        const studentId = document.getElementById('createStudentIdInput').value;

        if (!studentId) {
            alert('Please enter your student ID.');
            return;
        }

        fetch(`http://127.0.0.1:8000/Student/${studentId}/CreateGroup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({})
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            alert(data.messsage);
            window.location.href = 'yourGroup.html';
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
            alert('Failed to create group');
        });
    }

    // Funkcja do dołączania do istniejącej grupy
    function joinGroup() {
        const studentId = document.getElementById('studentIdInput').value;
        const inviteCode = document.getElementById('inviteCodeInput').value;
        if (!studentId || !inviteCode) {
            alert('Please enter both your student ID and the invite code.');
            return;
        }

        fetch(`http://127.0.0.1:8000/Student/${studentId}/JoinGroup/${inviteCode}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({})
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            //alert(data.message);
            alert('Udało się dołączyć do grupy!')
            window.location.href = 'yourGroup.html';
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
            alert('Failed to join group');
        });
    }
    // Zamknięcie modala
    closeModal.addEventListener('click', function() {
        modal.style.display = 'none';
    });

    // Dodaj nasłuchiwacz zdarzeń do przycisku "Utwórz"
    createGroupButton.addEventListener('click', createGroup);

    // Dodaj nasłuchiwacz zdarzeń do przycisku "Dołącz"
    joinGroupButton.addEventListener('click', joinGroup);
});
