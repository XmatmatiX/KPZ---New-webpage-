"use strict"
document.addEventListener("DOMContentLoaded", function() {
    // Pobierz przycisk "Wyloguj się"
    var logoutButton = document.getElementById("logout");

    // Dodaj nasłuchiwanie zdarzenia kliknięcia na przycisku "Wyloguj się"
    logoutButton.addEventListener("click", function() {
        // Przenieś użytkownika do strony landingPage.html
        window.location.href = "../landingPage.html";
    });
});

document.addEventListener("DOMContentLoaded", function() {
    // Pobierz przycisk "Wyloguj się"
    var adminButton = document.getElementById("homeAdmin");

    // Dodaj nasłuchiwanie zdarzenia kliknięcia na przycisku "Wyloguj się"
    adminButton.addEventListener("click", function() {
        // Przenieś użytkownika do strony landingPage.html
        window.location.href = "adminHome.html";
    });
});

document.addEventListener("DOMContentLoaded", function() {
    // Pobierz przycisk "Wyloguj się"
    var groupsWithoutTopic = document.getElementById("groups");

    // Dodaj nasłuchiwanie zdarzenia kliknięcia na przycisku "Wyloguj się"
    groupsWithoutTopic.addEventListener("click", function() {
        // Przenieś użytkownika do strony landingPage.html
        window.location.href = "groups.html";
    });
});

document.addEventListener("DOMContentLoaded", function() {
    // Pobierz przycisk "Wyloguj się"
    var groupsWithoutTopic = document.getElementById("searchStudent");

    // Dodaj nasłuchiwanie zdarzenia kliknięcia na przycisku "Wyloguj się"
    groupsWithoutTopic.addEventListener("click", function() {
        // Przenieś użytkownika do strony landingPage.html
        window.location.href = "students.html";
    });
});

document.addEventListener("DOMContentLoaded", function() {
    // Pobierz przycisk "Wyloguj się"
    var groupsWithoutTopic = document.getElementById("addTopic");

    // Dodaj nasłuchiwanie zdarzenia kliknięcia na przycisku "Wyloguj się"
    groupsWithoutTopic.addEventListener("click", function() {
        // Przenieś użytkownika do strony landingPage.html
        window.location.href = "addTopic.html";
    });
});

document.addEventListener("DOMContentLoaded", function() {
    // Pobierz przycisk "Wyloguj się"
    var groupsWithoutTopic = document.getElementById("addGroup");

    // Dodaj nasłuchiwanie zdarzenia kliknięcia na przycisku "Wyloguj się"
    groupsWithoutTopic.addEventListener("click", function() {
        // Przenieś użytkownika do strony landingPage.html
        window.location.href = "addGroup.html";
    });
});

document.addEventListener("DOMContentLoaded", function() {
    // Pobierz przycisk "Wyloguj się"
    var groupsWithoutTopic = document.getElementById("notifications");

    // Dodaj nasłuchiwanie zdarzenia kliknięcia na przycisku "Wyloguj się"
    groupsWithoutTopic.addEventListener("click", function() {
        // Przenieś użytkownika do strony landingPage.html
        window.location.href = "notifications.html";
    });
});

document.addEventListener("DOMContentLoaded", function() {
    // Pobierz przycisk "Wyloguj się"
    var groupsWithoutTopic = document.getElementById("settings");

    // Dodaj nasłuchiwanie zdarzenia kliknięcia na przycisku "Wyloguj się"
    groupsWithoutTopic.addEventListener("click", function() {
        // Przenieś użytkownika do strony landingPage.html
        window.location.href = "settings.html";
    });
});

document.addEventListener("DOMContentLoaded", function() {
    // Pobierz przycisk "Wyloguj się"
    var topics = document.getElementById("topicsStudent");

    // Dodaj nasłuchiwanie zdarzenia kliknięcia na przycisku "Wyloguj się"
    topics.addEventListener("click", function() {
        // Przenieś użytkownika do strony landingPage.html
        window.location.href = "topicsView.html";
    });
});

document.addEventListener("DOMContentLoaded", function() {
    // Pobierz przycisk "Wyloguj się"
    var newTopic = document.getElementById("addNewTopic");

    // Dodaj nasłuchiwanie zdarzenia kliknięcia na przycisku "Wyloguj się"
    newTopic.addEventListener("click", function() {
        // Przenieś użytkownika do strony landingPage.html
        window.location.href = "addTopic.html";
    });
});

// Project List

document.addEventListener("DOMContentLoaded", function() {
    // Pobranie danych z endpointa GET /ProjectList
    fetch('http://127.0.0.1:8000/ProjectList')
        .then(response => response.json())
        .then(data => {
            const topicList = document.getElementById('topicList');

            console.log("Dane")
            console.log(data)

            const projects = data['projects:']; // Pobranie tablicy projektów
            console.log("Projects")
            console.log(projects)

            // Generowanie nowych elementów HTML na podstawie danych z tokena
            projects.forEach(topic => {
                const topicItem = document.createElement('div');
                topicItem.classList.add('topicItem');

                // Ustalenie tekstu dla groupSize
                let groupMin = topic.mingroupsize;
                let groupMax = topic.maxgroupsize;
                if (groupMax === groupMin)
                {
                    topicItem.innerHTML = `
                        <p>${topic.logopath}</p>
                        <p>${topic.companyname}</p>
                        <p>${topic.projecttitle}</p>
                        <p>${topic.maxgroupsize}</p>
                        <p>${topic.groupnumber}</p>
                    `;
                }
                else {
                    topicItem.innerHTML = `
                        <p>${topic.logopath}</p>
                        <p>${topic.companyname}</p>
                        <p>${topic.projecttitle}</p>
                        <p>${topic.mingroupsize} - ${topic.maxgroupsize}</p>
                        <p>${topic.groupnumber}</p>
                    `;
                }

                // Dodanie nasłuchiwania zdarzenia kliknięcia na każdy element topicItem
                topicItem.addEventListener('click', function() {
                    // Wyświetlenie szczegółów tematu po kliknięciu
                    alert(`Szczegóły tematu:\n${topic.projecttitle}\n${topic.companyname}\nGroup Size: ${topic.mingroupsize} - ${topic.maxgroupsize}\nGroup Number: ${topic.groupnumber}`);
                });

                topicList.appendChild(topicItem);
            });
        })
        .catch(error => console.error('Błąd pobierania danych:', error));
});

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

                // Dodanie pojedynczego projektu do listy
                topicList.appendChild(topicItem);
            }
        })
        .catch(error => console.error('Błąd pobierania danych:', error));
});