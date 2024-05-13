"use strict"

document.addEventListener("DOMContentLoaded", function() {
    // Pobranie danych z endpointa GET /ProjectList
    fetch('http://127.0.0.1:8000/Admin/Groups')
        .then(response => response.json())
        .then(data => {
            const groupList = document.getElementById('groupList');

            const groups = data['groups:']; // Pobranie tablicy projektów
            console.log("Groups")
            console.log(groups)

            // Generowanie nowych elementów HTML na podstawie danych z tokena
            groups.forEach(topic => {
                const groupItem = document.createElement('div');
                groupItem.classList.add('groupItem');

                // Ustalenie tekstu dla groupSize
                // let groupMin = topic.mingroupsize;
                // let groupMax = topic.maxgroupsize;
                // if (groupMax === groupMin)
                // {
                //     groupItem.innerHTML = `
                //         <p>${topic.logopath}</p>
                //         <p>${topic.companyname}</p>
                //         <p>${topic.projecttitle}</p>
                //         <p>${topic.maxgroupsize}</p>
                //         <p>${topic.groupnumber}</p>
                //     `;
                // }
                // else {
                //     groupItem.innerHTML = `
                //         <p>${topic.logopath}</p>
                //         <p>${topic.companyname}</p>
                //         <p>${topic.projecttitle}</p>
                //         <p>${topic.mingroupsize} - ${topic.maxgroupsize}</p>
                //         <p>${topic.groupnumber}</p>
                //     `;
                // }
                //
                // // Dodanie nasłuchiwania zdarzenia kliknięcia na każdy element topicItemAdmin
                // groupItem.addEventListener('click', function() {
                //     // Przekierowanie użytkownika do widoku reservationDetails, przekazując ID projektu jako parametr w adresie URL
                //     window.location.href = `topicDetails.html?id=${topic.projectid}`;
                // });

                groupList.appendChild(groupItem);
            });
        })
        .catch(error => console.error('Błąd pobierania danych:', error));
});