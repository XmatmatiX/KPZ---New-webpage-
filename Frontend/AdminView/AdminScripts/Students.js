"use strict"

document.addEventListener("DOMContentLoaded", function() {

    fetch(`http://127.0.0.1:8000/Admin/Students`)
        .then(response => response.json())
        .then(data => {

            console.log("WSZYSCY STUDENCI")
            console.log(data)

            const students = document.getElementById('studentList');

            const emails = data['emails'];
            const groups = data['groups'];
            const ids = data['ids'];
            const names = data['names'];
            const surnames = data['surnames'];

            // Iteracja przez wszystkich studentów
            for (let i = 0; i < emails.length; i++) {
                const studentItem = document.createElement('div');
                studentItem.classList.add('studentItem');

                const groupContent = groups[i] !== null ? groups[i] : `<button class="groupButton">Przypisz grupę</button>`;

                // Utworzenie HTML dla pojedynczego projektu
                studentItem.innerHTML = `
                    <p>${emails[i]}</p>
                    <p>${names[i]}</p>
                    <p>${surnames[i]}</p>
                    <p>${groupContent}</p>
                `;

                // Dodanie nasłuchiwania zdarzenia kliknięcia na każdy element topicItemAdmin
                // studentItem.addEventListener('click', function() {
                //     // Przekierowanie użytkownika do widoku reservationDetails, przekazując ID projektu jako parametr w adresie URL
                //     window.location.href = `reservationDetails.html?id=${projecstid[i]}`;
                // });

                // Dodanie pojedynczego projektu do listy
                students.appendChild(studentItem);
            }

        })
        .catch(error => console.error('Błąd pobierania danych:', error));

    const freeCheckbox = document.getElementById('freeCheckbox');

    freeCheckbox.addEventListener('change', function() {
        // Sprawdź, czy checkbox jest zaznaczony
        if (this.checked) {

            console.log("Checked")

            fetch(`http://127.0.0.1:8000/Admin/FreeStudents`)
                .then(response => response.json())
                .then(details => {

                    console.log("Szczegoly")
                    console.log(details)

                    const studentList = details["students:"];
                    console.log(studentList);

                })
                .catch(error => console.error('Błąd pobierania danych:', error));

        } else {

        }
    });

    // const addButton = document.getElementById("addAdmin");
    // const cleanButton = document.getElementById("cleanDatabase");
    //
    // // Dodaj nasłuchiwanie zdarzenia kliknięcia na przycisku "Wyloguj się"
    // addButton.addEventListener("click", function() {
    //
    //     const emailInput = document.getElementById('newAdmin')
    //     const email = emailInput.value;
    //
    //     fetch(`http://127.0.0.1:8000/Admin/AdminCreate/${email}`, {
    //         method: 'PUT'
    //     })
    //         .then(response => {
    //             if (!response.ok) {
    //                 throw new Error('Network response was not ok');
    //             }
    //             return response.json();
    //         })
    //         .then(data => {
    //             console.log('Dodano nowego administratora:', email);
    //         })
    //         .catch(error => console.error('Błąd pobierania danych:', error));
    // });
});