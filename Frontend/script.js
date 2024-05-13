"use strict"

document.addEventListener("DOMContentLoaded", function() {

    var loginButton = document.getElementById("loginButton");

    loginButton.addEventListener("click", function() {
        // Przenieś użytkownika do strony loginPage.html
        window.location.href = "loginPage.html";
    });
});

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
    var homeButton = document.getElementById("homeButton");

    // Dodaj nasłuchiwanie zdarzenia kliknięcia na przycisku "Wyloguj się"
    homeButton.addEventListener("click", function() {
        // Przenieś użytkownika do strony landingPage.html
        window.location.href = "studentHome.html";
    });
});

document.addEventListener("DOMContentLoaded", function() {
    // Pobierz przycisk "Wyloguj się"
    var searchButton = document.getElementById("searchButton");

    // Dodaj nasłuchiwanie zdarzenia kliknięcia na przycisku "Wyloguj się"
    searchButton.addEventListener("click", function() {
        // Przenieś użytkownika do strony landingPage.html
        window.location.href = "freeGroups.html";
    });
});

document.addEventListener("DOMContentLoaded", function() {
    // Pobierz przycisk "Wyloguj się"
    var groupButton = document.getElementById("groupButton");

    // Dodaj nasłuchiwanie zdarzenia kliknięcia na przycisku "Wyloguj się"
    groupButton.addEventListener("click", function() {
        // Przenieś użytkownika do strony landingPage.html
        window.location.href = "yourGroup.html";
    });
});

document.addEventListener("DOMContentLoaded", function() {
    // Pobierz przycisk "Wyloguj się"
    var enrollmentButton = document.getElementById("enrollmentButton");

    // Dodaj nasłuchiwanie zdarzenia kliknięcia na przycisku "Wyloguj się"
    enrollmentButton.addEventListener("click", function() {
        // Przenieś użytkownika do strony landingPage.html
        window.location.href = "enrollment.html";
    });
});

/* ADMIN VIEW*/

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

const login=() => {

    const inputLogin = document.getElementById("login");
    const inputPassword = document.getElementById("password");

    let valueLogin = inputLogin.value;
    let valuePassword = inputLogin.value;

    console.log("Login: ", valueLogin);
    console.log("Password: ", valuePassword);

    if(valueLogin === "" || valuePassword ==="")
    {
        const message = document.getElementById("errorLogin");
        message.style.display = "flex";
    }
}

const logo = document.querySelector('.logoImage');

logo.addEventListener('click', () => {
    window.location.href = 'landingPage.html'; // Przenieś użytkownika na stronę główną
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