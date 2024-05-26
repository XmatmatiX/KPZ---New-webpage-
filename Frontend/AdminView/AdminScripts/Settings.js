"use strict"

document.addEventListener("DOMContentLoaded", function() {

    const addButton = document.getElementById("addAdmin");
    const cleanButton = document.getElementById("cleanDatabase");
    const uploadButton = document.getElementById("uploadFiles");
    const excelButton = document.getElementById("excelFiles");
    const adminList = document.getElementById("adminList");

    const pdfUpload = document.getElementById('pdf-upload');
    const fileName = document.getElementById('file-name');
    const fileLabel = document.querySelector('.file-label');
    const removeFileButton = document.getElementById('remove-file');

    fileLabel.addEventListener('click', () => {
        pdfUpload.click();
    });

    pdfUpload.addEventListener('change', () => {
        if (pdfUpload.files.length > 0) {
            fileName.textContent = pdfUpload.files[0].name;
            removeFileButton.style.display = 'inline';
        } else {
            fileName.textContent = 'Nie wybrano pliku';
            removeFileButton.style.display = 'none';
        }
    });

    removeFileButton.addEventListener('click', () => {
        pdfUpload.value = '';
        fileName.textContent = 'Nie wybrano pliku';
        removeFileButton.style.display = 'none';
    })

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

    excelButton.addEventListener("click", function() {

        const fileInput = document.getElementById('pdf-upload');
        const file = fileInput.files[0];

        // Sprawdź, czy plik został wybrany
        if (!file) {
            console.error('Nie wybrano pliku');
            return;
        }

        // Utwórz obiekt FormData
        const formData = new FormData();
        formData.append('pdf_file', file);

        fetch(`http://127.0.0.1:8000/Admin/ExcelFile`, {
            method: 'POST',
            body: formData
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                console.log("Prawidłowo załadowano pliki Excel");
            })
            .catch(error => console.error('Błąd pobierania danych:', error));

    });

    uploadButton.addEventListener("click", function() {

        fetch(`http://127.0.0.1:8000/Admin/UploadProjects`, {
            method: 'POST'
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                console.log("Prawidłowo załadowano pliki");
            })
            .catch(error => console.error('Błąd pobierania danych:', error));

    });

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

            location.reload()
    });

    // AdminList

    fetch(`http://127.0.0.1:8000/Admin/AdminList`)
        .then(response => response.json())
        .then(data => {

            const emails = data['email'];
            const ids = data['ids'];
            const names = data['names'];
            const surnames = data['surnames'];

            for(let i=0; i<emails.length; i++) {

                const adminItem = document.createElement('div');
                adminItem.classList.add('adminItem');

                const fullName = `${names[i]} ${surnames[i]}`;

                adminItem.innerHTML = `
                     <p>${emails[i]}</p>
                     <p>${fullName}</p>
                     <button class="searchButton deleteButton">Usuń</button>
                `;

                // Dodanie nasłuchiwania zdarzenia kliknięcia do przycisku "Usuń"
                const deleteButton = adminItem.querySelector('.deleteButton');
                deleteButton.addEventListener('click', function() {
                    const modal = document.getElementById('deleteAdmin');

                    // elementy do zamykania modalu
                    //const span = document.getElementsByClassName("close2")[0];
                    const span = document.getElementById("closeButton");
                    const confirmBtn = document.getElementById("confirmButton");
                    const cancelBtn = document.getElementById("cancelButton");

                    function closeModal() {
                        modal.style.display = "none";
                    }

                    // Przypisanie obsługi zdarzeń do przycisków
                    modal.style.display = "block";
                    span.onclick = closeModal;
                    confirmBtn.onclick = function() {

                        fetch(`http://127.0.0.1:8000/Admin/AdminDelete/${ids[i]}`, {
                            method: 'PUT'
                        })
                            .then(response => {
                                if (response.ok) {
                                    // Powiadomienie zostało pomyślnie usunięte, możesz wykonać odpowiednie akcje, np. odświeżyć listę powiadomień
                                    console.log('Administrator został prawidłowo usunięty');
                                    location.reload();

                                } else {
                                    console.error('Wystąpił błąd podczas usuwania administratora');
                                }
                            })
                            .catch(error => console.error('Błąd usuwania administratora:', error));

                        closeModal();

                    }
                    cancelBtn.onclick = closeModal; // Zamknij modal po anulowaniu
                });

                adminList.appendChild(adminItem);

            }

        })
        .catch(error => console.error('Błąd pobierania danych projektu:', error));
});