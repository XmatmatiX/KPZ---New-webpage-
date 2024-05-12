"use strict"

// Admin Project List
document.addEventListener("DOMContentLoaded", function() {
    // Pobranie danych z endpointa GET /ProjectList
    fetch('http://127.0.0.1:8000/Admin/ProjectList')
        .then(response => response.json())
        .then(data => {
            const topicList = document.getElementById('adminTopics');

            console.log("Dane")
            console.log(data)

            const logos = data['logos'];
            const companynames = data['companynames'];
            const titles = data['titles'];
            const projecstid = data['projecstid'];
            const minsizes = data['minsizes'];
            const maxsizes = data['maxsizes'];
            const status = data['status'];
            const group = data['group'];

            console.log("Logos")
            console.log(logos)

            // Iteracja przez wszystkie projekty
            for (let i = 0; i < titles.length; i++) {
                const topicItem = document.createElement('div');
                topicItem.classList.add('topicItemAdmin');

                // Ustalenie tekstu dla groupSize
                let groupSizeText = minsizes[i];
                if (minsizes[i] !== maxsizes[i]) {
                    groupSizeText += ` - ${maxsizes[i]}`;
                }

                // Utworzenie HTML dla pojedynczego projektu
                topicItem.innerHTML = `
                    <p>${logos[i] ? logos[i] : 'Brak'}</p>
                    <p>${companynames[i]}</p>
                    <p>${titles[i]}</p>
                    <p>${group[i] ? group[i] : 'Brak'}</p>
                    <p>${groupSizeText}</p>
                    <p>${status[i]}</p>
                `;

                // Dodanie nasłuchiwania zdarzenia kliknięcia na każdy element topicItemAdmin
                topicItem.addEventListener('click', function() {
                    // Przekierowanie użytkownika do widoku reservationDetails, przekazując ID projektu jako parametr w adresie URL
                    window.location.href = `reservationDetails.html?id=${projecstid[i]}`;
                });

                // Dodanie pojedynczego projektu do listy
                topicList.appendChild(topicItem);
            }
        })
        .catch(error => console.error('Błąd pobierania danych:', error));
});