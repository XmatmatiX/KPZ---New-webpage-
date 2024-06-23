
// function translateRole(role) {
//     switch(role) {
//         case 'leader':
//             return 'Lider';
//         case 'student':
//             return 'Student';
//         default:
//             return 'Nieznany';
//     }
// }

const leaderForm = document.getElementById('leader-form');
const nominateButton = document.getElementById('nominate');
const unsubscribeButton = document.getElementById('delete-reservation');
const token = sessionStorage.getItem("JWT");
    // Funkcja do pobierania członków grupy z serwera
    function fetchGroupMembers() {
        fetch(`https://projekty.kpz.pwr.edu.pl/api/Student/Group`, {
                    headers: {
                    "Authorization": `Bearer ${token}`
                 }
                })
            .then(response => response.json())
            .then(data => {
                leaderForm.innerHTML = '';  // Wyczyść formularz przed dodaniem nowych elementów
                data.members.forEach(member => {
                    const role = member.role;
                    const div = document.createElement('div');
                    div.innerHTML = `
                        <label id="${member.role}" class="member" data-role="${member.role}">
                            <input type="radio" name="leader" value="${member.id}">
                            <img src="../Images/Vector.jpg" alt="Avatar studenta">
                            <p>${member.name} ${member.surname} - ${member.role}</p>
                        </label>
                    `;
                    leaderForm.appendChild(div);
                });
            })
            .catch(error => {
                console.error('Error fetching group members:', error);
                alert('Failed to load group members');
            });
    }

document.addEventListener('DOMContentLoaded', function() {




    // Funkcja do zmiany lidera grupy
    function changeLeader(event) {
        event.preventDefault();

        const selectedLeader = document.querySelector('input[name="leader"]:checked');
        if (!selectedLeader) {
            alert("Please select a new leader.");
            return;
        }

        const leaderId = selectedLeader.value;


        fetch(`https://projekty.kpz.pwr.edu.pl/api/Student/ChangeLeader/${leaderId}`, {
            method: 'PUT',
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
            alert(data.message);
            window.location.href = 'groupRedirect.html';
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
            alert('Failed to change leader');
        });
    }


    // Funkcja do usunięcia rezerwacji projektu przez lidera grupy
function deleteProjectReservation() {
    if (!confirm('Czy na pewno chcesz usunąć rezerwację projektu?')) {
        return; // Jeśli użytkownik kliknie "Anuluj" w oknie dialogowym, funkcja zostanie przerwana.
    }

    fetch(`https://projekty.kpz.pwr.edu.pl/api/Student/QuitProject`, {
        method: 'DELETE', // Metoda HTTP DELETE
        headers: {
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${token}`
        }

    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(data => {
                throw new Error(data.detail);
            });
        }
        return response.json(); // Jeśli odpowiedź jest 'ok', zwracamy JSON
    })
    .then(data => {
        alert(data.message); // Wyświetlamy komunikat o sukcesie
        window.location.href = 'groupRedirect.html';
    })
    .catch(error => {
        console.error('Wystąpił problem z operacją usunięcia rezerwacji:', error);
        alert('Wystąpił błąd: ' + error.message); // Wyświetlamy komunikat o błędzie
    });
}



    // Dodaj nasłuchiwacz zdarzeń do przycisku "Nominuj lidera"
    nominateButton.addEventListener('click', changeLeader);
    unsubscribeButton.addEventListener('click', deleteProjectReservation);

});




