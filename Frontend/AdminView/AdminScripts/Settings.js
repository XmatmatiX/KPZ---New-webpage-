"use strict"

document.addEventListener("DOMContentLoaded", function() {

    const addButton = document.getElementById("addAdmin");
    const cleanButton = document.getElementById("cleanDatabase");

    // Dodaj nasłuchiwanie zdarzenia kliknięcia na przycisku "Wyloguj się"
    addButton.addEventListener("click", function() {

        const emailInput = document.getElementById('newAdmin')
        const email = emailInput.value;

        fetch(`http://127.0.0.1:8000/Admin/AdminCreate/${email}`, {
            method: 'PUT'
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                console.log('Dodano nowego administratora:', email);
            })
            .catch(error => console.error('Błąd pobierania danych:', error));
    });

    cleanButton.addEventListener("click", function () {

        const modal = document.getElementById('cleanModal');

        // elementy do zamykania modalu
        const span = document.getElementsByClassName("close")[0];
        const confirmBtn = document.getElementById("confirmBtn");
        const cancelBtn = document.getElementById("cancelBtn");

        function closeModal() {
            modal.style.display = "none";
        }

        // Przypisanie obsługi zdarzeń do przycisków
        modal.style.display = "block";
        span.onclick = closeModal;
        confirmBtn.onclick = function() {

            fetch(`http://127.0.0.1:8000/Admin/database-clear`, {
                method: 'DELETE'
            })
                .then(response => {
                    if (response.ok) {

                        console.log('Baza danych została pomyślnie wyczyszczona');
                        location.reload()
                    } else {
                        console.error('Wystąpił błąd podczas próby wyczyszczenia bazy danych');
                    }
                })
                .catch(error => console.error('Błąd czyszczenia bazy danych:', error));

            closeModal();
        }
        cancelBtn.onclick = closeModal;
    });
});