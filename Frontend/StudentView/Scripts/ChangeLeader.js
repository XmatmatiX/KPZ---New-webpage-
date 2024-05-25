document.addEventListener('DOMContentLoaded', function() {
    const leaderForm = document.getElementById('leader-form');
    const searchGroupButton = document.getElementById('searchGroupButton');
    const nominateButton = document.getElementById('nominate');

    // Funkcja do pobierania członków grupy z serwera
    function fetchGroupMembers(studentId) {
        fetch(`http://127.0.0.1:8000/Student/Group/${studentId}`)
            .then(response => response.json())
            .then(data => {
                leaderForm.innerHTML = '';  // Wyczyść formularz przed dodaniem nowych elementów
                data.members.forEach(member => {
                    const div = document.createElement('div');
                    div.innerHTML = `
                        
                            <input type="checkbox" id="user${member.id}" name="leader" value="${member.id}">
                            <img src="../Images/Vector.jpg" alt="Avatar studenta">
                            <p>${member.name} ${member.surname} - ${member.role}</p>
                    `;
                    leaderForm.appendChild(div);
                });
            })
            .catch(error => {
                console.error('Error fetching group members:', error);
                alert('Failed to load group members');
            });
    }

    // Funkcja do zmiany lidera grupy
    function changeLeader(event) {
        event.preventDefault();

        const selectedLeader = document.querySelector('input[name="leader"]:checked');
        if (!selectedLeader) {
            alert("Please select a new leader.");
            return;
        }

        const leaderId = selectedLeader.value;

        fetch(`http://127.0.0.1:8000/Student/ChangeLeader/${leaderId}`, {
            method: 'PUT',
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
            alert(data.message);
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
            alert('Failed to change leader');
        });
    }

    // Pobierz członków grupy po kliknięciu przycisku "Szukaj"
    searchGroupButton.addEventListener('click', function() {
        const studentId = document.getElementById('groupIdInput').value;
        if (studentId) {
            fetchGroupMembers(studentId);
        } else {
            alert('Please enter a student ID.');
        }
    });

    // Dodaj nasłuchiwacz zdarzeń do przycisku "Nominuj lidera"
    nominateButton.addEventListener('click', changeLeader);
});
document.addEventListener('DOMContentLoaded', function() {
    const deleteReservationButton = document.getElementById('unsubscribeButton');
    const userId = 1; // Replace with actual user ID

    deleteReservationButton.addEventListener('click', function() {
        if (confirm('Czy na pewno chcesz usunąć rezerwację?')) {
            fetch(`http://127.0.0.1:8000/Student/${userId}/QuitProject`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(data => {
                        throw new Error(data.detail);
                    });
                }
                return response.json();
            })
            .then(data => {
                alert(data.message);
                window.location.href = 'enrollment.html';
            })
            .catch(error => {
                console.error('There was a problem with the delete operation:', error);
                alert('Failed to delete reservation: ' + error.message);
            });
        }
    });
});


