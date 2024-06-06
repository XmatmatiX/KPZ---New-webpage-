"use strict"

document.addEventListener("DOMContentLoaded", function() {

    const urlParams = new URLSearchParams(window.location.search);
    const reservationId = urlParams.get('id');

    fetch(`http://127.0.0.1:8000/api/Admin/Reservation/${reservationId}`)
        .then(response => response.json())
        .then(data => {

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

            const groupDetails = document.getElementById('group')
            groupDetails.innerHTML = `
                <p>Grupa</p>
                <p class="group2">${data.group}</p>
            `;

            const group2Element = groupDetails.querySelector('.group2');

            group2Element.addEventListener('click', () => {
                window.location.href = `groupDetails.html?id=${data.group}`;
            });

            const stateDetails = document.getElementById('state')
            const translatdeStatus = translateStatus(data.state);
            stateDetails.innerHTML = `
                <p>Status</p>
                <p class="group">${translatdeStatus}</p>
            `;
            const themaDetails = document.getElementById('thema')
            themaDetails.innerHTML = `
                <p>Temat</p>
                <p class="group2">${data.thema}</p>
            `;

            const themaElement = themaDetails.querySelector('.group2');

            themaElement.addEventListener('click', () => {
                window.location.href = `topicDetails.html?id=${data.pid}`;
            });

            const companyDetails = document.getElementById('company')
            companyDetails.innerHTML = `
                <p>Firma</p>
                <p class="group">${data.company}</p>
            `;

        })
        .catch(error => console.error('Błąd pobierania danych:', error));
});