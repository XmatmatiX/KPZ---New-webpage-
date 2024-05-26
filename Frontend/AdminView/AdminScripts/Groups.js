"use strict"

document.addEventListener("DOMContentLoaded", function() {
    // Pobranie danych z endpointa GET /ProjectList
    fetch('http://127.0.0.1:8000/Admin/Groups')
        .then(response => response.json())
        .then(data => {
            const groupList = document.getElementById('groupList');

            const groups = data['groups:']; // Pobranie tablicy projektów

            const groupids = groups['groupids'];
            const leaders = groups['leaders'];
            const groupsize = groups['groupsize'];
            const guardians = groups['guardians'];
            const projectTitles = groups['project_titles'];
            const companys = groups['companys'];

            // Tworzenie tablicy obietnic fetch
            const fetchGuardianPromises  = guardians.map(guardianId => {
                return fetch(`http://127.0.0.1:8000/Admin/Guardian/${guardianId}`)
                    .then(response => response.json())
                    .then(data => `${data.name} ${data.surname}`)
                    .catch(error => {
                        console.error('Błąd pobierania danych:', error);
                        return ''; // Zwrócenie pustego ciągu w przypadku błędu
                    });
            });

            // Oczekiwanie na zakończenie wszystkich żądań fetch
            Promise.all([...fetchGuardianPromises])
                .then(dataArray  => {

                    const guardiansData = dataArray.slice(0, guardians.length);
                    const projectsData = dataArray.slice(guardians.length);
                    for (let i = 0; i < groupids.length; i++) {

                        const groupItem = document.createElement('div');
                        groupItem.classList.add('groupItem');

                        const guardian = guardiansData[i];

                        groupItem.innerHTML = `
                            <p>${groupids[i]}</p>
                            <p>${companys[i]}</p>
                            <p>${projectTitles[i]}</p>
                            <p>${groupsize[i]}</p>
                            <p>${guardian}</p>
                        `;

                        groupItem.addEventListener('click', function() {
                            // Przekierowanie użytkownika do widoku reservationDetails, przekazując ID projektu jako parametr w adresie URL
                            window.location.href = `groupDetails.html?id=${groupids[i]}`;
                        });

                        groupList.appendChild(groupItem);
                    }
                });
        })
        .catch(error => console.error('Błąd pobierania danych:', error));
});