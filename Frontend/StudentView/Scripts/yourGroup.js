document.addEventListener("DOMContentLoaded", function() {
    const searchButton = document.getElementById('searchGroupButton');

    searchButton.addEventListener('click', function(event) {
        event.preventDefault();
        const groupIdInput = document.getElementById('groupIdInput');

        if (!groupIdInput) {
            console.error('Input element for group ID not found');
            return;
        }

        const groupId = groupIdInput.value;
        if (!groupId) {
            alert('Proszę wpisać ID grupy.');
            return;
        }

        fetchGroupDetails(groupId);
    });

    function fetchGroupDetails(groupId) {
        fetch(`https://projekty.kpz.pwr.edu.pl/api/Student/Group/${groupId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log(data); // Log data to see its structure
                updateMemberDetails(data.members); // Assume `members` is directly under `data`
                updateProjectDetails(data); // Pass the whole data object if it contains all needed info
            })
            .catch(error => {
                console.error('Błąd pobierania danych:', error);
                alert(`Nie udało się pobrać danych grupy: ${error.message}`);
            });
    }

    function updateMemberDetails(members) {
        const memberDetailsContainer = document.getElementById('member-details');
        if (memberDetailsContainer) {
            let membersHtml = '<h7>Członkowie grupy</h7>';
            members.forEach(member => {
                membersHtml += `
                    <div class="member">
                        <img src="../Images/Vector.jpg" alt="Avatar studenta">
                        <p>${member.name} ${member.surname} - ${member.role}</p>
                    </div>
                `;
            });
            memberDetailsContainer.innerHTML = membersHtml;
        } else {
            console.error('Member details container not found');
        }
    }

    function updateProjectDetails(data) {
        const projectDetailsContainer = document.getElementById('project-details');
        if (projectDetailsContainer) {
            projectDetailsContainer.innerHTML = `
                <h7>Opiekun grupy</h7>
                <p><strong>Kod zaproszenia:</strong> ${data.invite_code || 'Brak'}</p>
                <p><strong>Rozmiar grupy:</strong> ${data.group_size || 'Brak'}</p>
                <p><strong>Imię i nazwisko:</strong> ${data.guardian_info?.guardian_name || 'Brak'}</p>
                <p><strong>Email:</strong> ${data.guardian_info?.guardian_email || 'Brak'}</p>
                <h7>Projekt</h7>
                <p><strong>Firma:</strong> ${data.contact_info?.company || 'Brak'}</p>
                <p><strong>Status projektu:</strong> ${data.contact_info?.status || 'Brak'}</p>
                <p><strong>Email kontaktowy:</strong> ${data.contact_info?.contact_email || 'Brak'}</p>
                <p><strong>Telefon kontaktowy:</strong> ${data.contact_info?.contact_phone || 'Brak'}</p>
            `;
        } else {
            console.error('Project details container not found');
        }
    }
});
document.addEventListener('DOMContentLoaded', function() {
    const unsubscribeButton = document.getElementById('leaveButton');

    // Funkcja do rezygnacji z grupy
    function leaveGroup() {
        const studentId = 44;

        fetch(`https://projekty.kpz.pwr.edu.pl/api/Student/unsubscribe/${studentId}`, {
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
            alert(data.message);
              window.location.href = 'enrollment.html';
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
            alert('Failed to unsubscribe from the group');
        });
    }

    // Dodaj nasłuchiwacz zdarzeń do przycisku "Opuść grupę"
    unsubscribeButton.addEventListener('click', leaveGroup);
});
