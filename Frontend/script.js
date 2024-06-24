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

document.addEventListener("DOMContentLoaded", function () {
    const enrollmentTime = document.getElementById("enrollmentTime");

    fetch(`https://projekty.kpz.pwr.edu.pl/api/TimeReservation`)
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
           // console.log(error);
        });

})

const login=() => {

    const inputLogin = document.getElementById("login");
    const inputPassword = document.getElementById("password");

    let valueLogin = inputLogin.value;
    let valuePassword = inputPassword.value;

  //  console.log("Login: ", valueLogin);
   // console.log("Password: ", valuePassword);

    if(valueLogin === "" || valuePassword ==="")
    {
        const message = document.getElementById("errorLogin");
        message.style.display = "flex";
    }
    else
    {
        const userLogin = {
            email: valueLogin,
            password: valuePassword
        }

        fetch(`https://projekty.kpz.pwr.edu.pl/api/login`,{
            method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userLogin)
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(error => {
                    throw new Error(error.detail); // rzucenie błędu z szczegółami
                });
            }
            //console.log((response));
            return response.json();
        })
            .then(data => {
                sessionStorage.setItem("JWT", data.access_token);
                //alert('Udało się zalogować!');
                redirectToHomePage();
        })
        .catch(error => alert('Błąd pobierania danych:', error));

    }
}

const register=()=>{
    //window.location.href="registerPage.html";
    const inputPassword = document.getElementById("password");
    const inputPassword2 = document.getElementById("password2");
    const inputEmail = document.getElementById("email");
    const inputName = document.getElementById("name");
    const inputSurname=document.getElementById("surname");

    let valuePassword = inputPassword.value;
    let valuePassword2 = inputPassword2.value;
    let email = inputEmail.value;
    let name=inputName.value;
    let surname=inputSurname.value;

    if(valuePassword==="" || valuePassword2==="")
        alert("Nie podano hasla")
    else if (valuePassword!==valuePassword2)
        alert("Hasła powinny być takie same!")
    else if(name==="" || surname==="" || email==="")
        alert("Podaj wszytskie wartości")

    else if(!email.endsWith("pwr.edu.pl"))
        alert("Jesteś z poza organzacji. Nie możesz się zarejestrować!")
    else
    {
        const newUser = {
            email: email,
            password: valuePassword,
            name: name,
            surname: surname
        }

       // console.log(newUser)
        fetch(`https://projekty.kpz.pwr.edu.pl/api/Register`,{
            method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newUser)
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(error => {
                 //   console.log(error.detail);
                    alert(error.detail)
                    throw new Error(error.detail);
                });

            }
            return response.json();
        })
            .then(data => {
                sessionStorage.setItem("JWT", data.access_token);
                alert('Udało się stworzyć użytkownika!');
                redirectToHomePage();
                //window.location.href = 'loginPage.html';
        })
        .catch(error => alert('Błąd pobierania danych:', error.message));

    }

}

function redirectToHomePage()
{
    const token = sessionStorage.getItem("JWT");
    fetch("https://projekty.kpz.pwr.edu.pl/api/User/Role", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
    }).then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    }).then(data => {
        if (data === "student")
            window.location.href = "./StudentView/studentHome.html";
        else if(data === "leader")
            window.location.href = "./StudentView/studentHome.html";
        else if(data === "admin")
            window.location.href = "./AdminView/adminHome.html";
    }).catch(error => {
        console.error('Error:', error);
    });
}

const logo = document.querySelector('.logoImage');

logo.addEventListener('click', () => {
    window.location.href = 'landingPage.html'; // Przenieś użytkownika na stronę główną
});

function allProjects(topicList) {

    fetch('https://projekty.kpz.pwr.edu.pl/api/ProjectList')
        .then(response => response.json())
        .then(data => {

            const logos = data['logos'];
            const companynames = data['companynames'];
            const titles = data['titles'];
            const projecstid = data['projecstid'];
            const minsizes = data['minsizes'];
            const maxsizes = data['maxsizes'];
            const status = data['status'];

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
                    logoHTML = `<img class="logo-main" src="https://projekty.kpz.pwr.edu.pl/${logos[i]}" alt="There should be a photo">`;
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

    fetch(`https://projekty.kpz.pwr.edu.pl/api/ProjectListFree`)
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
                    logoHTML = `<img class="logo-main" src="https://projekty.kpz.pwr.edu.pl/${logos[i]}" alt="There should be a photo">`;
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

function displaySearchedTopics(topics, data) {

    const logos = data['logos'];
    const companynames = data['companynames'];
    const titles = data['titles'];
    const projecstid = data['projecstid'];
    const minsizes = data['minsizes'];
    const maxsizes = data['maxsizes'];
    const status = data['status'];

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
            logoHTML = `<img class="logo-main" src="https://projekty.kpz.pwr.edu.pl/${logos[i]}" alt="There should be a photo">`;
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
}

document.addEventListener("DOMContentLoaded", function() {

    const topicList = document.getElementById('topicList');
    const freeCheckbox = document.getElementById('freeCheckbox');
    const searchTopic = document.getElementById('findTopic');
    const topicInput = document.getElementById('topicSearch');

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

    function searching() {

        const topic = topicInput.value;

        if(topic === '') {
            topicList.innerHTML = '';

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
        else {
            fetch(`https://projekty.kpz.pwr.edu.pl/api/ProjectListSearch/${topic}`, {
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    displaySearchedTopics(topicList, data);
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