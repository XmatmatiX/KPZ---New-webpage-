document.addEventListener('DOMContentLoaded', function() {
    const createGroupButton = document.querySelector('.create-btn');
    const joinGroupButton = document.querySelector('.join-btn');
    const modal = document.getElementById('joinGroupModal');
    const closeModal = document.querySelector('.close');
    const token = sessionStorage.getItem("JWT");
    // Funkcja do tworzenia nowej grupy
    function createGroup() {
        //const studentId = document.getElementById('createStudentIdInput').value;

        //if (!studentId) {
            //alert('Please enter your student ID.');
            //return;
        //}

        fetch(`https://projekty.kpz.pwr.edu.pl/api/Student/CreateGroup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                "Authorization": `Bearer ${token}`
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
            window.location.href = 'groupRedirect.html';
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
            alert('Failed to create group');
        });
    }

    // Funkcja do dołączania do istniejącej grupy
    function joinGroup() {
        const inviteCode = document.getElementById('inviteCodeInput').value;
        if (!inviteCode) {
            alert('Please enter the invite code.');
            return;
        }

        fetch(`https://projekty.kpz.pwr.edu.pl/api/Student/JoinGroup/${inviteCode}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({})
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(error => {
                    throw new Error(error.detail); // rzucenie błędu z szczegółami
                });

            }
            return response.json();
        })
        .then(data => {
             alert('Udało się dołączyć do grupy!');
             window.location.href = 'groupRedirect.html';

        })
        .catch(error => {
            alert(`Nie udało się dołączyć do grupy: ${error.message}`);
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
