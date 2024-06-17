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

document.addEventListener("DOMContentLoaded", function () {
    const enrollmentTime = document.getElementById("enrollmentTime");

    fetch(`http://127.0.0.1:8000/TimeReservation`)
        .then(response => response.json())
        .then(data => {

            const datetime = new Date(data['datatime']);
            const formattedDate = datetime.toLocaleString('default', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
            });

            enrollmentTime.textContent = formattedDate;

        })
        .catch(error => {
            console.log(error);
        });

})

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

function allProjects(topicList) {

    fetch('http://127.0.0.1:8000/ProjectList')
        .then(response => response.json())
        .then(data => {

            const logos = data['logos'];
            const companynames = data['companynames'];
            const titles = data['titles'];
            const projecstid = data['projecstid'];
            const minsizes = data['minsizes'];
            const maxsizes = data['maxsizes'];
            const status = data['status'];

            function translateStatus(status) {
                switch(status) {
                    case 'available':
                        return 'Dostępny';
                    case 'reserved':
                        return 'Zarezerwowany';
                    case 'taken':
                        return 'Zajęty';
                    default:
                        return 'Nieznany';
                }
            }

            // Iteracja przez wszystkie projekty
            for (let i = 0; i < titles.length; i++) {
                const topicItem = document.createElement('div');
                topicItem.classList.add('topicItem');

                // Ustalenie tekstu dla groupSize
                let groupSizeText = minsizes[i];
                if (minsizes[i] !== maxsizes[i]) {
                    groupSizeText += ` - ${maxsizes[i]}`;
                }

                const translatedStatus = translateStatus(status[i]);

                let logoHTML = '';
                if (logos[i] === null) {
                    logoHTML = 'BRAK';
                } else {
                    logoHTML = `<img class="logo" src="../../../Backend/${logos[i]}" alt="There should be a photo">`;
                }

                // Utworzenie HTML dla pojedynczego projektu
                topicItem.innerHTML = `
                    ${logoHTML}
                    <p>${companynames[i]}</p>
                    <p>${titles[i]}</p>
                    <p>${groupSizeText}</p>
                    <p>${translatedStatus}</p>
                `;

                // Dodanie nasłuchiwania zdarzenia kliknięcia na każdy element topicItemAdmin
                topicItem.addEventListener('click', function () {
                    // Przekierowanie użytkownika do widoku reservationDetails, przekazując ID projektu jako parametr w adresie URL
                    window.location.href = `topicDetails.html?id=${projecstid[i]}`;
                });

                // Dodanie pojedynczego projektu do listy
                topicList.appendChild(topicItem);
            }
        })
        .catch(error => console.error('Błąd pobierania danych:', error));

}

function freeProjects(topics) {

    fetch(`http://127.0.0.1:8000/ProjectListFree`)
        .then(response => response.json())
        .then(details => {

            topics.innerHTML = '';

            const borderElement = document.createElement('div');
            borderElement.classList.add('borderItem');
            borderElement.innerHTML = `
                <p>Logo</p>
                <p>Firma</p>
                <p>Temat</p>
                <p>Rozmiar grupy</p>
                <p>Status</p>
            `;
            topics.appendChild(borderElement);

            const logos = details['logos'];
            const companynames = details['companynames'];
            const titles = details['titles'];
            const projecstid = details['projecstid'];
            const minsizes = details['minsizes'];
            const maxsizes = details['maxsizes'];
            const status = details['status'];

            function translateStatus(status) {
                switch(status) {
                    case 'available':
                        return 'Dostępny';
                    case 'reserved':
                        return 'Zarezerwowany';
                    case 'taken':
                        return 'Zajęty';
                    default:
                        return 'Nieznany';
                }
            }

            for (let i = 0; i < titles.length; i++) {
                const topicItem = document.createElement('div');
                topicItem.classList.add('topicItem');

                // Ustalenie tekstu dla groupSize
                let groupSizeText = minsizes[i];
                if (minsizes[i] !== maxsizes[i]) {
                    groupSizeText += ` - ${maxsizes[i]}`;
                }

                const translatedStatus = translateStatus(status[i]);

                let logoHTML = '';
                if (logos[i] === null) {
                    logoHTML = 'BRAK';
                } else {
                    logoHTML = `<img class="logo" src="../../../Backend/${logos[i]}" alt="There should be a photo">`;
                }

                // Utworzenie HTML dla pojedynczego projektu
                topicItem.innerHTML = `
                    ${logoHTML}
                    <p>${companynames[i]}</p>
                    <p>${titles[i]}</p>
                    <p>${groupSizeText}</p>
                    <p>${translatedStatus}</p>
                `;

                // Dodanie nasłuchiwania zdarzenia kliknięcia na każdy element topicItemAdmin
                topicItem.addEventListener('click', function () {
                    // Przekierowanie użytkownika do widoku reservationDetails, przekazując ID projektu jako parametr w adresie URL
                    window.location.href = `topicDetails.html?id=${projecstid[i]}`;
                });

                // Dodanie pojedynczego projektu do listy
                topics.appendChild(topicItem);
            }

        })
        .catch(error => console.error('Błąd pobierania danych:', error));
}

document.addEventListener("DOMContentLoaded", function() {

    const topicList = document.getElementById('topicList');
    const freeCheckbox = document.getElementById('freeCheckbox');

    allProjects(topicList)

    freeCheckbox.addEventListener('change', function() {
        // Sprawdź, czy checkbox jest zaznaczony
        if (this.checked) {

            freeProjects(topicList)

        } else {
            topicList.innerHTML = ''; // Wyczyść listę studentów przed wyświetleniem nowych wyników

            // Dodanie elementu borderStudents2 ponownie
            const borderElement = document.createElement('div');
            borderElement.classList.add('borderItem');
            borderElement.innerHTML = `
                <p>Logo</p>
                <p>Firma</p>
                <p>Temat</p>
                <p>Rozmiar grupy</p>
                <p>Status</p>
            `;
            topicList.appendChild(borderElement);
            allProjects(topicList)
        }

    });

});