"use strict"

document.addEventListener("DOMContentLoaded", function() {
    // Pobranie danych z endpointa GET /ProjectList
    fetch('http://127.0.0.1:8000/Admin/Reservations')
        .then(response => response.json())
        .then(data => {
            const topicList = document.getElementById('adminTopics');

            const ids = data['reservations_id'];
            const logos = data['logos'];
            const company = data['company'];
            const topic = data['topic'];
            const project_group = data['project_group'];
            const status = data['status'];

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
                    default:
                        return 'Nieznany';
                }
            }

            // Iteracja przez wszystkie projekty
            for (let i = 0; i < topic.length; i++) {
                const topicItem = document.createElement('div');
                topicItem.classList.add('topicItemAdmin2');

                const translatedStatus = translateStatus(status[i]);

                topicItem.innerHTML = `
                    <p>${logos[i] ? logos[i] : 'Brak'}</p>
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
                topicList.appendChild(topicItem);
            }
        })
        .catch(error => console.error('Błąd pobierania danych:', error));
});