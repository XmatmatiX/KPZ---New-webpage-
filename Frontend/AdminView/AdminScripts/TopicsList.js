"use strict"

const token = sessionStorage.getItem("JWT");

document.addEventListener("DOMContentLoaded", function() {
    //Pobranie danych z endpointa GET /ProjectList
    fetch('http://127.0.0.1:8000/Admin/ProjectList', {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    })
        .then(response => )
            {
                if (!response.ok) {
                        if (response.status === 401)
                        {
                            window.location.href = "../LoginPage.html";
                            throw new Error('Not authorized');
                        }
                        else
                            throw new Error('Network response was not ok');
                    }
                    return response.json();
            })
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
                if (topic.logopath === null || topic.logopath === '') {
                    logoHTML = 'BRAK';
                } else {
                    logoHTML = `<img class="logo-main" src="../../../Backend/${topic.logopath}" alt="There should be a photo">`;
                }

                topicItem.innerHTML = `
                    ${logoHTML}
                    <p>${topic.companyname}</p>
                    <p>${topic.projecttitle}</p>
                    <p>${groupSizeText}</p>
                    <p>${topic.groupnumber}</p>
                `;

                // Dodanie nasłuchiwania zdarzenia kliknięcia na każdy element topicItemAdmin
                topicItem.addEventListener('click', function () {
                    // Przekierowanie użytkownika do widoku topicDetails, przekazując ID projektu jako parametr w adresie URL
                    window.location.href = `topicDetails.html?id=${topic.projectid}`;
                });

                topicList.appendChild(topicItem);
            });
        })
        .catch(error => console.error('Błąd pobierania danych:', error));
});

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
        const logoPath = topic.logopath ? `../../../Backend/${topic.logopath}` : '';

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
            logoHTML = `<img class="logo-main" src="../../../Backend/${topic.logopath}" alt="There should be a photo">`;
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
            fetch(`http://127.0.0.1:8000/Admin/ProjectListSearch/${topic}`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            })
                .then(response => )
            {
                if (!response.ok) {
                        if (response.status === 401)
                        {
                            window.location.href = "../LoginPage.html";
                            throw new Error('Not authorized');
                        }
                        else
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