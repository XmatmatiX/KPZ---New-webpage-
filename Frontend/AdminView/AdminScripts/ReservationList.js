"use strict"

function translateStatus(status) {
    switch(status) {
        case 'available':
            return 'Dostępny';
        case 'reserved':
            return 'Zarezerwowany';
        case 'taken':
            return 'Zajęty';
        case 'confirmed':
            return 'Zatwierdzony';
        case 'waiting':
            return 'Oczekujący';
        default:
            return 'Nieznany';
    }
}

function allProjects(projects) {

    // Pobranie danych z endpointa GET /ProjectList
    fetch('http://127.0.0.1:8000/Admin/Reservations')
        .then(response => response.json())
        .then(data => {

            const ids = data['reservations_id'];
            const logos = data['logos'];
            const company = data['company'];
            const topic = data['topic'];
            const project_group = data['project_group'];
            const status = data['status'];

            // Iteracja przez wszystkie projekty
            for (let i = 0; i < topic.length; i++) {
                const topicItem = document.createElement('div');
                topicItem.classList.add('topicItemAdmin2');

                const translatedStatus = translateStatus(status[i]);

                let logoHTML = '';
                if (logos[i] === null) {
                    logoHTML = 'BRAK';
                } else {
                    logoHTML = `<img class="logo" src="../../../Backend/${logos[i]}" alt="There should be a photo">`;
                }

                topicItem.innerHTML = `
                    ${logoHTML}
                    <p>${company[i]}</p>
                    <p>${topic[i]}</p>
                    <p>${project_group[i]}</p>
                    <p>${translatedStatus}</p>
                `;

                // Dodanie nasłuchiwania zdarzenia kliknięcia na każdy element topicItemAdmin
                topicItem.addEventListener('click', function () {
                    // Przekierowanie użytkownika do widoku reservationDetails, przekazując ID projektu jako parametr w adresie URL
                    window.location.href = `reservationDetails.html?id=${ids[i]}`;
                });

                // Dodanie pojedynczego projektu do listy
                projects.appendChild(topicItem);
            }
        })
        .catch(error => console.error('Błąd pobierania danych:', error));
}

function chosenProjects(projects, state) {

    fetch(`http://127.0.0.1:8000/Admin/ReservationStatus/${state}`)
        .then(response => response.json())
        .then(data => {

            const ids = data['reservations_id'];
            const logos = data['logos'];
            const company = data['company'];
            const topic = data['topic'];
            const project_group = data['project_group'];
            const status = data['status'];

            projects.innerHTML = '';

            const borderElement = document.createElement('div');
            borderElement.classList.add('borderItemAdmin2');
            borderElement.innerHTML = `
                <p>Logo</p>
                <p>Firma</p>
                <p>Temat</p>
                <p>Grupa</p>
                <p>Status</p>
            `;
            projects.appendChild(borderElement);

            // Iteracja przez wszystkie projekty
            for (let i = 0; i < topic.length; i++) {
                const topicItem = document.createElement('div');
                topicItem.classList.add('topicItemAdmin2');

                const translatedStatus = translateStatus(status[i]);

                let logoHTML = '';
                if (logos[i] === null) {
                    logoHTML = 'BRAK';
                } else {
                    logoHTML = `<img class="logo" src="../../../Backend/${logos[i]}" alt="There should be a photo">`;
                }

                topicItem.innerHTML = `
                    ${logoHTML}
                    <p>${company[i]}</p>
                    <p>${topic[i]}</p>
                    <p>${project_group[i]}</p>
                    <p>${translatedStatus}</p>
                `;

                // Dodanie nasłuchiwania zdarzenia kliknięcia na każdy element topicItemAdmin
                topicItem.addEventListener('click', function () {
                    // Przekierowanie użytkownika do widoku reservationDetails, przekazując ID projektu jako parametr w adresie URL
                    window.location.href = `reservationDetails.html?id=${ids[i]}`;
                });

                // Dodanie pojedynczego projektu do listy
                projects.appendChild(topicItem);
            }
        })
        .catch(error => console.error('Błąd pobierania danych:', error));

}

document.addEventListener("DOMContentLoaded", function() {

    const adminTopics = document.getElementById('adminTopics');
    const reservedCheckbox = document.getElementById('reservedCheckbox');
    const waitingCheckbox = document.getElementById('waitingCheckbox');

    allProjects(adminTopics);

    reservedCheckbox.addEventListener('change', function() {
        // Sprawdź, czy checkbox jest zaznaczony
        if (this.checked) {

            chosenProjects(adminTopics, "reserved")

        } else {
            adminTopics.innerHTML = ''; // Wyczyść listę projektow przed wyświetleniem nowych wyników

            const borderElement = document.createElement('div');
            borderElement.classList.add('borderItemAdmin2');
            borderElement.innerHTML = `
                <p>Logo</p>
                <p>Firma</p>
                <p>Temat</p>
                <p>Grupa</p>
                <p>Status</p>
            `;
            adminTopics.appendChild(borderElement);
            allProjects(adminTopics);
        }

    });

    waitingCheckbox.addEventListener('change', function() {
        // Sprawdź, czy checkbox jest zaznaczony
        if (this.checked) {

            chosenProjects(adminTopics, "waiting")

        } else {
            adminTopics.innerHTML = ''; // Wyczyść listę projektow przed wyświetleniem nowych wyników

            const borderElement = document.createElement('div');
            borderElement.classList.add('borderItemAdmin2');
            borderElement.innerHTML = `
                <p>Logo</p>
                <p>Firma</p>
                <p>Temat</p>
                <p>Grupa</p>
                <p>Status</p>
            `;
            adminTopics.appendChild(borderElement);
            allProjects(adminTopics);
        }

    });

});