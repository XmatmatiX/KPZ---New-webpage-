"use strict"

function allGroups(groupList) {

    fetch('http://127.0.0.1:8000/Admin/Groups')
        .then(response => response.json())
        .then(data => {

            const groups = data['groups:']; // Pobranie tablicy projektów

            const groupids = groups['groupids'];
            const leaders = groups['leaders'];
            const groupsize = groups['groupsize'];
            const guardians = groups['guardians'];
            const projectTitles = groups['project_titles'];
            const companys = groups['companys'];

            const fetchGuardianPromises  = guardians.map(guardianId => {
                if(guardianId) {
                    return fetch(`http://127.0.0.1:8000/Admin/Guardian/${guardianId}`)
                        .then(response => response.json())
                        .then(data => `${data.name} ${data.surname}`)
                        .catch(error => {
                            console.error('Błąd pobierania danych:', error);
                            return '';
                        });
                }
                else {
                    return 'Brak';
                }

            });

            // Oczekiwanie na zakończenie wszystkich żądań fetch
            Promise.all([...fetchGuardianPromises])
                .then(dataArray  => {

                    const guardiansData = dataArray.slice(0, guardians.length);
                    for (let i = 0; i < groupids.length; i++) {

                        const groupItem = document.createElement('div');
                        groupItem.classList.add('groupItem');

                        const projectTitle = projectTitles[i] || 'BRAK';
                        const company = companys[i] || 'BRAK';

                        const guardian = guardiansData[i];

                        groupItem.innerHTML = `
                            <p>${groupids[i]}</p>
                            <p>${company}</p>
                            <p>${projectTitle}</p>
                            <p>${groupsize[i]}</p>
                            <p>${guardian}</p>
                        `;

                        groupItem.addEventListener('click', function() {
                            window.location.href = `groupDetails.html?id=${groupids[i]}`;
                        });

                        groupList.appendChild(groupItem);
                    }
                });
        })
        .catch(error => console.error('Błąd pobierania danych:', error));
}
function freeGroups(groupList) {

    fetch('http://127.0.0.1:8000/Admin/GroupsWithoutProject')
        .then(response => response.json())
        .then(data => {

            const groups = data['groups:']; // Pobranie tablicy projektów

            const groupids = groups['groupids'];
            const leaders = groups['leaders'];
            const groupsize = groups['groupsize'];
            const guardians = groups['guardians'];
            const projectTitles = groups['project_titles'];
            const companys = groups['companys'];

            groupList.innerHTML = '';

            const borderElement = document.createElement('div');
            borderElement.classList.add('borderGroups');
            borderElement.innerHTML = `
                <p>ID grupy</p>
                <p>Firma</p>
                <p>Temat</p>
                <p>Liczba członków</p>
                <p>Prowadzący</p>
            `;
            groupList.appendChild(borderElement);

            const fetchGuardianPromises  = guardians.map(guardianId => {
                if(guardianId) {
                    return fetch(`http://127.0.0.1:8000/Admin/Guardian/${guardianId}`)
                        .then(response => response.json())
                        .then(data => `${data.name} ${data.surname}`)
                        .catch(error => {
                            console.error('Błąd pobierania danych:', error);
                            return '';
                        });
                }
                else {
                    return 'Brak';
                }

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
                            <p>BRAK</p>
                            <p>BRAK</p>
                            <p>${groupsize[i]}</p>
                            <p>${guardian}</p>
                        `;

                        groupItem.addEventListener('click', function() {
                            window.location.href = `groupDetails.html?id=${groupids[i]}`;
                        });

                        groupList.appendChild(groupItem);
                    }
                });
        })
        .catch(error => console.error('Błąd pobierania danych:', error));
}

function displaySearchedGroups(group, data) {

    group.innerHTML = '';

    const borderElement = document.createElement('div');
    borderElement.classList.add('borderGroups');
    borderElement.innerHTML = `
                <p>ID grupy</p>
                <p>Firma</p>
                <p>Temat</p>
                <p>Liczba członków</p>
                <p>Prowadzący</p>
            `;
    group.appendChild(borderElement);

    const groups = data['groups:']; // Pobranie tablicy projektów

    const groupids = groups['groupids'];
    const leaders = groups['leaders'];
    const groupsize = groups['groupsize'];
    const guardians = groups['guardians'];
    const projectTitles = groups['project_titles'];
    const companys = groups['companys'];

    const fetchGuardianPromises  = guardians.map(guardianId => {
        if(guardianId) {
            return fetch(`http://127.0.0.1:8000/Admin/Guardian/${guardianId}`)
                .then(response => response.json())
                .then(data2 => `${data2.name} ${data2.surname}`)
                .catch(error => {
                    console.error('Błąd pobierania danych:', error);
                    return '';
                });
        }
        else {
            return 'Brak';
        }

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
                    window.location.href = `groupDetails.html?id=${groupids[i]}`;
                });

                group.appendChild(groupItem);
            }
        });

}

document.addEventListener("DOMContentLoaded", function() {

    const groupList = document.getElementById('groupList');
    const freeCheckbox = document.getElementById('freeCheckbox');
    const searchGroup = document.getElementById('findGroup');
    const groupInput = document.getElementById('groupInput');

    allGroups(groupList);

    freeCheckbox.addEventListener('change', function() {
        // Sprawdź, czy checkbox jest zaznaczony
        if (this.checked) {

            freeGroups(groupList)

        } else {
            groupList.innerHTML = ''; // Wyczyść listę projektow przed wyświetleniem nowych wyników

            const borderElement = document.createElement('div');
            borderElement.classList.add('borderGroups');
            borderElement.innerHTML = `
                <p>ID grupy</p>
                <p>Firma</p>
                <p>Temat</p>
                <p>Liczba członków</p>
                <p>Prowadzący</p>
            `;
            groupList.appendChild(borderElement);
            allGroups(groupList);
        }

    });

    function searching() {

        const groupInput = document.getElementById('groupInput')
        const group = groupInput.value;

        if(group === '') {
            groupList.innerHTML = '';

            const borderElement = document.createElement('div');
            borderElement.classList.add('borderGroups');
            borderElement.innerHTML = `
                <p>ID grupy</p>
                <p>Firma</p>
                <p>Temat</p>
                <p>Liczba członków</p>
                <p>Prowadzący</p>
            `;
            groupList.appendChild(borderElement);
            allGroups(groupList);
        }
        else {
            fetch(`http://127.0.0.1:8000/Admin/SearchGroup/${group}`, {
                method: 'POST'
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    displaySearchedGroups(groupList, data);
                })
                .catch(error => console.error('Błąd pobierania danych:', error));
        }
    }

    searchGroup.addEventListener("click", function() {
        searching()
    });

    groupInput.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            searching();
        }
    });

});