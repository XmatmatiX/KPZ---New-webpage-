"use strict"

document.addEventListener("DOMContentLoaded", function() {
    // Pobierz przycisk "Wyloguj się"
    var notificationButton = document.getElementById("notificationButton");

    // Dodaj nasłuchiwanie zdarzenia kliknięcia na przycisku "Wyloguj się"
    notificationButton.addEventListener("click", function() {

        const urlParams = new URLSearchParams(window.location.search);
        const groupId = urlParams.get('id');

        window.location.href = `groupNotifications.html?id=${groupId}`;
    });
});

document.addEventListener("DOMContentLoaded", function() {

    const urlParams = new URLSearchParams(window.location.search);
    const groupId = urlParams.get('id');

    fetch(`http://127.0.0.1:8000/Admin/Group/${groupId}`)
        .then(response => response.json())
        .then(data => {

            console.log("Dane")
            console.log(data)

            function translateRole(role) {
                switch(role) {
                    case 'leader':
                        return 'Lider';
                    case 'student':
                        return 'Student';
                    default:
                        return 'Nieznany';
                }
            }

            function translateStatus(state) {
                switch(state) {
                    case 'available':
                        return 'Dostępny';
                    case 'reserved':
                        return 'Zarezerwowany';
                    case 'taken':
                        return 'Zajęty';
                    default:
                        return 'Nieznany';
                }
            }

            const groupid = document.getElementById('groupid')
            groupid.textContent = 'Grupa ' + data.id;

            const themaDetails = document.getElementById('thema')
            themaDetails.innerHTML = `
                <p>Temat</p>
                <p class="group">${data.thema}</p>
            `;
            const companyDetails = document.getElementById('company')
            companyDetails.innerHTML = `
                <p>Firma</p>
                <p class="group">${data.company}</p>
            `;
            const guardianDetails = document.getElementById('guardian')
            guardianDetails.innerHTML = `
                <p>Prowadzący</p>
                <p class="group"></p>
            `;

            const stateDetails = document.getElementById('state')
            const translatdeStatus = translateStatus(data.state);
            stateDetails.innerHTML = `
                <p>Status</p>
                <p class="group">${translatdeStatus}</p>
            `;

            const students = document.getElementById('studentGroupList');

            const members = data['members']; // Pobranie tablicy projektów
            console.log("members")
            console.log(members)

            members.forEach(member => {
                const memberItem = document.createElement('div');
                memberItem.classList.add('studentGroupItem')

                const roleClass = member.rolename === 'leader' ? 'leader' : 'student';
                memberItem.classList.add('studentGroupItem', roleClass);

                const translatdeRole = translateRole(member.rolename);

                memberItem.innerHTML = `
                    <p>${member.email}</p>
                    <p>${member.name}</p>
                    <p>${member.surname}</p>
                    <p>${translatdeRole}</p>
                `;

                students.appendChild(memberItem)
            });
        })
        .catch(error => console.error('Błąd pobierania danych:', error));
});