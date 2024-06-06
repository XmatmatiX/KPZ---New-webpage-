"use strict"

document.addEventListener("DOMContentLoaded", function() {

    var notificationButton = document.getElementById("notificationButton");
    const urlParams = new URLSearchParams(window.location.search);
    const groupId = urlParams.get('id');

    const errorModal = document.getElementById('errorModal');
    const modalText = errorModal.querySelector('.textModal p');
    const closeButton = document.querySelector('#errorModal .close');
    const confirmButton = document.getElementById('confButton');

    closeButton.addEventListener('click', function() {
        errorModal.style.display = 'none';
    });

    confirmButton.addEventListener('click', function() {
        errorModal.style.display = 'none';
    });

    notificationButton.addEventListener("click", function() {
        window.location.href = `groupNotifications.html?id=${groupId}`;
    });

    var closeButtons = document.querySelectorAll(".close");
    closeButtons.forEach(function(closeButton) {
        closeButton.addEventListener("click", function() {
            var modal = this.closest(".deleteModal");
            modal.style.display = "none";
        });
    });

    var cancelButton = document.getElementById("cancelBtn");
    cancelButton.addEventListener("click", function() {
        var modal = this.closest(".deleteModal");
        modal.style.display = "none";
    });

    var confirmBtn = document.getElementById("confirmBtn");
    confirmBtn.addEventListener("click", function() {

        fetch(`http://127.0.0.1:8000/api/Admin/Group/${groupId}/Confirm`, {
            method: 'PUT'
        })
            .then(response => {
                if (!response.ok) {
                    console.error('Wystąpił błąd podczas zatwierdzania');
                }
                else {
                    var modal = this.closest(".deleteModal");
                    modal.style.display = "none";
                    location.reload();
                }
            })
            .catch(error => {
                console.error('Wystąpił błąd podczas zatwierdzania:', error);
                errorModal.style.display = 'block';
                modalText.textContent = `Wystąpił błąd podczas zatwierdzania: ${error.message}`;
            });

    });

    var confirmationButton = document.getElementById("confirmationButton");

    confirmationButton.addEventListener("click", function() {

        var confirmModal = document.getElementById("confirmModal");
        confirmModal.style.display = "block";
    });
});

document.addEventListener("DOMContentLoaded", function() {

    const urlParams = new URLSearchParams(window.location.search);
    const groupId = urlParams.get('id');

    fetch(`http://127.0.0.1:8000/api/Admin/Group/${groupId}`)
        .then(response => response.json())
        .then(data => {

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
                    case 'confirmed':
                        return 'Zatwierdzony';
                    case 'waiting':
                        return 'Oczekujący na zatwierdzenie';
                    default:
                        return 'Nieznany';
                }
            }

            const guardianId = data.guardian;

            const groupid = document.getElementById('groupid')
            groupid.textContent = 'Grupa ' + data.id;

            const themaDetails = document.getElementById('thema')
            const thema = data.thema || 'BRAK';
            themaDetails.innerHTML = `
                <p>Temat</p>
                <p class="group">${thema}</p>
            `;
            const companyDetails = document.getElementById('company')
            const company = data.company || 'BRAK';
            companyDetails.innerHTML = `
                <p>Firma</p>
                <p class="group">${company}</p>
            `;

            const guardianDetails = document.getElementById('guardian');

            if(guardianId) {
                fetch(`http://127.0.0.1:8000/api/Admin/Guardian/${guardianId}`)
                    .then(response => response.json())
                    .then(data => {
                        const guardianName = `${data.name} ${data.surname}`;

                        guardianDetails.innerHTML = `
                        <p>Prowadzący</p>
                        <p class="group">${guardianName}</p>
                    `;
                    })
                    .catch(error => console.error('Błąd pobierania danych opiekuna:', error));
            }
            else {
                guardianDetails.innerHTML = `
                   <p>Prowadzący</p>
                   <p class="group">Brak</p>
                `;
            }

            const stateDetails = document.getElementById('state')
            const translatdeStatus = translateStatus(data.state);
            stateDetails.innerHTML = `
                <p>Status</p>
                <p class="group">${translatdeStatus}</p>
            `;

            const confirmationSection = document.getElementById("confirmationSection");
            if (!data.thema) {
                confirmationSection.style.display = 'none';
            } else {
                confirmationSection.style.display = 'article';

                const confirmation = document.getElementById("confirmation");
                const conf = data['confirmation-path'] || 'BRAK';
                confirmation.textContent = `${conf}`;
            }

            const students = document.getElementById('studentGroupList');

            const members = data['members'];

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