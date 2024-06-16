"use strict"

function allProjects(topicList) {

    //Pobranie danych z endpointa GET /ProjectList
    fetch('https://projekty.kpz.pwr.edu.pl/api/Admin/ProjectList')
        .then(response => response.json())
        .then(data => {

            const projects = data['projects:']; // Pobranie tablicy projektów

            // Generowanie nowych elementów HTML na podstawie danych z tokena
            projects.forEach(topic => {
                const topicItem = document.createElement('div');
                topicItem.classList.add('topicItem');

                // Ustalenie tekstu dla groupSize
                let groupMin = topic.mingroupsize;
                let groupMax = topic.maxgroupsize;
                let groupSizeText = topic.maxgroupsize;
                if (topic.maxgroupsize !== topic.mingroupsize) {
                    groupSizeText = `${topic.mingroupsize} - ${topic.maxgroupsize}`;
                }

                let logoHTML = '';
                if (topic.logopath === null || topic.logopath === '') {
                    logoHTML = 'BRAK';
                } else {
                    logoHTML = `<img class="logo-main" src="https://projekty.kpz.pwr.edu.pl/${topic.logopath}" alt="There should be a photo">`;
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

}

function displaySearchedTopis(topics, data) {

    const projects = data['projects:'];

    topicList.innerHTML = '';

    const borderElement = document.createElement('div');
    borderElement.classList.add('borderItem');
    borderElement.innerHTML = `
                <p>Logo</p>
                <p>Firma</p>
                <p>Temat</p>
                <p>Rozmiar grupy</p>
                <p>Ilość grup</p>
            `;
    topicList.appendChild(borderElement);

    // Generowanie nowych elementów HTML na podstawie danych z tokena
    projects.forEach(topic => {
        const topicItem = document.createElement('div');
        topicItem.classList.add('topicItem');

        let groupSizeText = topic.maxgroupsize;
        if (topic.maxgroupsize !== topic.mingroupsize) {
            groupSizeText = `${topic.mingroupsize} - ${topic.maxgroupsize}`;
        }

        let logoHTML = '';
        if (topic.logopath === null || topic.logopath === '') {
            logoHTML = 'BRAK';
        } else {
            logoHTML = `<img class="logo-main" src="https://projekty.kpz.pwr.edu.pl/${topic.logopath}" alt="There should be a photo">`;
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

}

document.addEventListener("DOMContentLoaded", function() {

    const searchTopic = document.getElementById('searchTopics');
    const topicInput = document.getElementById('search');
    const topicList = document.getElementById('topicList');

    allProjects(topicList);

    function searching() {

        const topic = topicInput.value;

        if(topic === '') {
            topicList.innerHTML = '';

            const borderElement = document.createElement('div');
            borderElement.classList.add('borderItem');
            borderElement.innerHTML = `
                <p>Logo</p>
                <p>Firma</p>
                <p>Temat</p>
                <p>Rozmiar grupy</p>
                <p>Ilość grup</p>
            `;
            topicList.appendChild(borderElement);
            allProjects(topicList);
        }
        else {
            fetch(`https://projekty.kpz.pwr.edu.pl/api/Admin/ProjectListSearch/${topic}`, {
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    displaySearchedTopis(topicList, data);
                })
                .catch(error => console.error('Błąd pobierania danych:', error));
        }
    }

    searchTopic.addEventListener("click", function() {
        searching()
    });

    topicInput.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            searching();
        }
    });

});