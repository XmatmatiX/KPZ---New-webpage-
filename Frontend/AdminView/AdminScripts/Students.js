"use strict"

document.addEventListener("DOMContentLoaded", function() {

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

                })
                .catch(error => console.error('Błąd pobierania danych:', error));

        } else {
            // Wykonaj działania, które mają być wykonane po odznaczeniu pola
            console.log('Checkbox został odznaczony');
            // Tutaj możesz dodać dowolne inne działania
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