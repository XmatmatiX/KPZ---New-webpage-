"use strict"

const token = sessionStorage.getItem("JWT");

document.addEventListener("DOMContentLoaded", function() {
    //Pobranie danych z endpointa GET /ProjectList
    fetch('http://127.0.0.1:8000/Admin/ProjectList', {
                    headers: {
                    "Authorization": `Bearer ${token}`
                 }
                })
        .then(response => response.json())
        .then(data => {
            const topicList = document.getElementById('topicList');

            const projects = data['projects:']; // Pobranie tablicy projektów

            // Generowanie nowych elementów HTML na podstawie danych z tokena
            projects.forEach(topic => {
                const topicItem = document.createElement('div');
                topicItem.classList.add('topicItem');
                const logoPath = topic.logopath ? `../../../Backend/${topic.logopath}` : '';

                // Ustalenie tekstu dla groupSize
                let groupMin = topic.mingroupsize;
                let groupMax = topic.maxgroupsize;
                let groupSizeText = topic.maxgroupsize;
                if (topic.maxgroupsize !== topic.mingroupsize) {
                    groupSizeText = `${topic.mingroupsize} - ${topic.maxgroupsize}`;
                }

                let logoHTML = '';
                if (topic.logopath === null) {
                    logoHTML = 'BRAK';
                } else {
                    logoHTML = `<img class="logo" src="../../../Backend/${topic.logopath}" alt="There should be a photo">`;
                }

                topicItem.innerHTML = `
                    ${logoHTML}
                    <p>${topic.companyname}</p>
                    <p>${topic.projecttitle}</p>
                    <p>${groupSizeText}</p>
                    <p>${topic.groupnumber}</p>
                `;

                // Dodanie nasłuchiwania zdarzenia kliknięcia na każdy element topicItemAdmin
                topicItem.addEventListener('click', function() {
                    // Przekierowanie użytkownika do widoku topicDetails, przekazując ID projektu jako parametr w adresie URL
                    window.location.href = `topicDetails.html?id=${topic.projectid}`;
                });

                topicList.appendChild(topicItem);
            });
        })
        .catch(error => console.error('Błąd pobierania danych:', error));
});