"use strict"

function checkRole()
{
    const token = sessionStorage.getItem("JWT");
            fetch("http://127.0.0.1:8000/User/Role", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                 },
                }).then(response => {
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
                }).then(data => {
                    if (data !== "admin")
                        window.location.href = "../landingPage.html";
                }).catch(error => {
                    console.error('Error:', error);
                });
}

document.addEventListener("DOMContentLoaded", function() {
    // Pobierz przycisk "Wyloguj się"
    var logoutButton = document.getElementById("logout");

    // Dodaj nasłuchiwanie zdarzenia kliknięcia na przycisku "Wyloguj się"
    logoutButton.addEventListener("click", function() {
        // Przenieś użytkownika do strony landingPage.html
        window.location.href = "../Logout.html";
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

const logo = document.querySelector('.logoImage');

logo.addEventListener('click', () => {
    window.location.href = 'adminHome.html'; // Przenieś użytkownika na stronę główną
});