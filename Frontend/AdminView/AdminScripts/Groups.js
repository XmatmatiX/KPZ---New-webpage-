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
            groups.forEach(group => {
                const groupItem = document.createElement('div');
                groupItem.classList.add('groupItem');

                groupItem.innerHTML = `
                    <p>${group.groupid}</p>
                    <p>Firma</p>
                    <p>Temat</p>
                    <p>${group.groupsize}</p>
                    <p>${group.guardianid}</p>
                `;

                groupItem.addEventListener('click', function() {
                    // Przekierowanie użytkownika do widoku reservationDetails, przekazując ID projektu jako parametr w adresie URL
                    window.location.href = `groupDetails.html?id=${group.groupid}`;
                });

                groupList.appendChild(groupItem);
            });
        })
        .catch(error => console.error('Błąd pobierania danych:', error));
});