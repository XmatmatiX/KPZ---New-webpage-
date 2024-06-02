"use strict"

document.addEventListener("DOMContentLoaded", function() {
    // Pobranie danych z endpointa GET /ProjectList
    // fetch('http://127.0.0.1:8000/Admin/ProjectList')
    //     .then(response => response.json())
    //     .then(data => {
    //         const topicList = document.getElementById('topicList');
    //
    //         const projects = data['projects:']; // Pobranie tablicy projektów
    //
    //         // Generowanie nowych elementów HTML na podstawie danych z tokena
    //         projects.forEach(topic => {
    //             const topicItem = document.createElement('div');
    //             topicItem.classList.add('topicItem');
    //
    //             // Ustalenie tekstu dla groupSize
    //             let groupMin = topic.mingroupsize;
    //             let groupMax = topic.maxgroupsize;
    //             if (groupMax === groupMin)
    //             {
    //                 topicItem.innerHTML = `
    //                     <p>${topic.logopath}</p>
    //                     <p>${topic.companyname}</p>
    //                     <p>${topic.projecttitle}</p>
    //                     <p>${topic.maxgroupsize}</p>
    //                     <p>${topic.groupnumber}</p>
    //                 `;
    //             }
    //             else {
    //                 topicItem.innerHTML = `
    //                     <p>${topic.logopath ? topic.logopath : 'Brak'}</p>
    //                     <p>${topic.companyname}</p>
    //                     <p>${topic.projecttitle}</p>
    //                     <p>${topic.mingroupsize} - ${topic.maxgroupsize}</p>
    //                     <p>${topic.groupnumber}</p>
    //                 `;
    //             }
    //
    //             // Dodanie nasłuchiwania zdarzenia kliknięcia na każdy element topicItemAdmin
    //             topicItem.addEventListener('click', function() {
    //                 // Przekierowanie użytkownika do widoku topicDetails, przekazując ID projektu jako parametr w adresie URL
    //                 window.location.href = `topicDetails.html?id=${topic.projectid}`;
    //             });
    //
    //             topicList.appendChild(topicItem);
    //         });
    //     })
    //     .catch(error => console.error('Błąd pobierania danych:', error));
    fetch('http://127.0.0.1:8000/Admin/ProjectList')
        .then(response => response.json())
        .then(data => {
            const topicList = document.getElementById('topicList');

            const logos = data['logos'];
            const companynames = data['companynames'];
            const titles = data['titles'];
            const projecstid = data['projecstid'];
            const minsizes = data['minsizes'];
            const maxsizes = data['maxsizes'];
            const status = data['status'];

            function translateStatus(status) {
                switch(status) {
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

            // Iteracja przez wszystkie projekty
            for (let i = 0; i < titles.length; i++) {
                const topicItem = document.createElement('div');
                topicItem.classList.add('topicItem');

                // Ustalenie tekstu dla groupSize
                let groupSizeText = minsizes[i];
                if (minsizes[i] !== maxsizes[i]) {
                    groupSizeText += ` - ${maxsizes[i]}`;
                }

                const translatedStatus = translateStatus(status[i]);

                // Utworzenie HTML dla pojedynczego projektu
                topicItem.innerHTML = `
                    <p>${logos[i] ? logos[i] : 'Brak'}</p>
                    <p>${companynames[i]}</p>
                    <p>${titles[i]}</p>
                    <p>${groupSizeText}</p>
                    <p>${translatedStatus}</p>
                `;

                // Dodanie nasłuchiwania zdarzenia kliknięcia na każdy element topicItemAdmin
                topicItem.addEventListener('click', function () {
                    // Przekierowanie użytkownika do widoku reservationDetails, przekazując ID projektu jako parametr w adresie URL
                    window.location.href = `topicDetails.html?id=${projecstid[i]}`;
                });

                // Dodanie pojedynczego projektu do listy
                topicList.appendChild(topicItem);
            }
        })
        .catch(error => console.error('Błąd pobierania danych:', error));
});