"use strict"

const token = sessionStorage.getItem("JWT");

document.addEventListener("DOMContentLoaded", function() {

    const addButton = document.getElementById("addAdmin");
    const cleanButton = document.getElementById("cleanDatabase");
    const uploadButton = document.getElementById("uploadFiles");
    const excelButton = document.getElementById("excelFiles");
    const adminList = document.getElementById("adminList");
    const deleteExcel = document.getElementById("deleteExcel");
    const enrollmentTime = document.getElementById("enrollmentTime");
    const setTime = document.getElementById("setTime");

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
            console.log(error);
        });

    const errorModal = document.getElementById('errorModal');
    const modalText = errorModal.querySelector('.textModal p');
    const closeButton = document.querySelector('#errorModal .close');
    const confirmButton = document.getElementById('confButton');

    closeButton.addEventListener('click', function() {
        errorModal.style.display = 'none';
    });

    confirmButton.addEventListener('click', function() {
        errorModal.style.display = 'none';
    });

    const warningModal = document.getElementById('warningModal');
    const modalText1 = warningModal.querySelector('.textModal p');
    const closeButton1 = document.querySelector('#warningModal .close');
    const confirmButton1 = document.getElementById('confButton1');

    closeButton1.addEventListener('click', function() {
        warningModal.style.display = 'none';
        location.reload();
    });

    confirmButton1.addEventListener('click', function() {
        warningModal.style.display = 'none';
        location.reload();
    });

    const deleteModalExcel = document.getElementById('deleteExcelFile');
    const closeButton2 = document.getElementById('closeButton2');
    const confirmButton2 = document.getElementById('confirmButton2');
    const cancelButton2 = document.getElementById('cancelButton2');

    deleteExcel.addEventListener("click", function () {
        deleteModalExcel.style.display = 'block';
    });

    closeButton2.addEventListener('click', function() {
        deleteModalExcel.style.display = 'none';
    });

    cancelButton2.addEventListener('click', function() {
        deleteModalExcel.style.display = 'none';
    });

    confirmButton2.addEventListener('click', function() {

        fetch(`https://projekty.kpz.pwr.edu.pl/api/Admin/ExcelFile`, {
            method: 'DELETE',
            headers: {
                    "Authorization": `Bearer ${token}`
                 }
        })
            .then(response => {
                if (response.ok) {
                    warningModal.style.display = 'block';
                    modalText1.textContent = `Plik Excel został pomyślnie usunięty`;
                } else {
                    console.error('Wystąpił błąd podczas próby usunięcia pliku');
                }
            })
            .catch(error => {
                errorModal.style.display = 'block';
                modalText.textContent = `Błąd podczas usuwania pliku Excel: ${error.message}`;
            });

        deleteModalExcel.style.display = 'none';
    });

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

            fetch(`https://projekty.kpz.pwr.edu.pl/api/Admin/database-clear`, {
                method: 'DELETE',
                headers: {
                    "Authorization": `Bearer ${token}`
                 }
            })
                .then(response => {
                    if (response.ok) {
                        warningModal.style.display = 'block';
                        modalText1.textContent = `Baza danych została pomyślnie wyczyszczona`;
                    } else {
                        console.error('Wystąpił błąd podczas próby wyczyszczenia bazy danych');
                    }
                })
                .catch(error => {
                    errorModal.style.display = 'block';
                    modalText.textContent = `Błąd czyszczenia bazy danych: ${error.message}`;
                });

            closeModal();
        }
        cancelBtn.onclick = closeModal;
    });

    excelButton.addEventListener("click", function() {

        const fileInput = document.getElementById('pdf-upload');
        const file = fileInput.files[0];

        if (!file) {
            errorModal.style.display = 'block';
            modalText.textContent = `Nie wybrano pliku`;
            return;
        }

        // Utwórz obiekt FormData
        const formData = new FormData();
        formData.append('excel_file', file);

        fetch(`https://projekty.kpz.pwr.edu.pl/api/Admin/ExcelFile`, {
            method: 'POST',
            body: formData,
            headers: {
                    "Authorization": `Bearer ${token}`
                 }
        })
            .then(response => {
                if (response.ok) {
                    return response.json().then(data => {
                        errorModal.style.display = 'block';
                        modalText.textContent = `Prawidłowo załadowano plik Excel`;
                    });
                } else {
                    return response.json().then(data => {
                        let errorMsg = data.detail || 'Wystąpił błąd podczas próby załadowania pliku';
                        if(data.error === "409: File already exists. If you want to replace it, please delete and upload a new one.") {
                            errorMsg = "409: Plik został już załadowany. Jeżeli chcesz go zmienić, musisz najpierw usunąć aktualny plik"
                        }
                        else if (data.error) {
                            errorMsg = data.error;
                        }

                        errorModal.style.display = 'block';
                        modalText.textContent = `${errorMsg}`;
                    });
                }
            })
            .catch(error => {
                errorModal.style.display = 'block';
                modalText.textContent = `Błąd podczas ładowania pliku: ${error.message}`;
            });

    });

    deleteExcel.addEventListener("click", function() {

    });

    uploadButton.addEventListener("click", function() {

        fetch(`https://projekty.kpz.pwr.edu.pl/api/Admin/UploadProjects`, {
            method: 'POST',
            headers: {
                    "Authorization": `Bearer ${token}`
                 }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                if (data.message === "Successfully submitted projects") {
                    // Jeśli otrzymano komunikat o sukcesie
                    errorModal.style.display = 'block';
                    modalText.textContent = `Prawidłowo załadowano plik`;
                } else {
                    // Jeśli otrzymano inny komunikat
                    errorModal.style.display = 'block';
                    modalText.textContent = data.message; // Wyświetl komunikat o błędzie
                }

            })
            .catch(error => {
                errorModal.style.display = 'block';
                modalText.textContent = `Błąd podczas ładowania pliku: ${error.message}`;
            });

    });

    setTime.addEventListener("click", function() {

        const dateTime = document.getElementById('datetime').value;

        if (dateTime) {
            const date = new Date(dateTime);

            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0'); // miesiące są 0-indeksowane
            const day = String(date.getDate()).padStart(2, '0');
            const hour = String(date.getHours()).padStart(2, '0');
            const minute = String(date.getMinutes()).padStart(2, '0');
            const second = String(date.getSeconds()).padStart(2, '0');

            fetch(`https://projekty.kpz.pwr.edu.pl/api/Admin/setTime/${year}:${month}:${day}:${hour}:${minute}:${second}`, {
                method: 'POST', // lub 'GET', zależnie od API
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ dateTime: dateTime })
            })
                .then(response => response.json())
                .then(data => {
                    warningModal.style.display = 'block';
                    modalText1.textContent = `Ustawiono datę na: ${date}`;
                })
                .catch((error) => {
                    errorModal.style.display = 'block';
                    modalText.textContent = `Wystąpił błąd: ${error}`;
                });
        } else {
            errorModal.style.display = 'block';
            modalText.textContent = `Proszę wybrać datę`;
        }
    });

    addButton.addEventListener("click", function() {

        const emailInput = document.getElementById('newAdmin')
        const email = emailInput.value;

        fetch(`https://projekty.kpz.pwr.edu.pl/api/Admin/AdminCreate/${email}`, {
            method: 'PUT',
            headers: {
                    "Authorization": `Bearer ${token}`
                 }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                warningModal.style.display = 'block';
                modalText1.textContent = `Dodano nowego administratora: ${email}`;
                //console.log('Dodano nowego administratora:', email);
            })
            .catch(error => {
                errorModal.style.display = 'block';
                modalText.textContent = `Błąd podczas dodawania administratora: ${error.message}`;
            });

            //location.reload()
    });

    // AdminList

    fetch(`https://projekty.kpz.pwr.edu.pl/api/Admin/AdminList`, {
                    headers: {
                    "Authorization": `Bearer ${token}`
                 }
                })
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

                        fetch(`https://projekty.kpz.pwr.edu.pl/api/Admin/AdminDelete/${ids[i]}`, {
                            method: 'PUT',
                            headers: {
                                "Authorization": `Bearer ${token}`
                            }
                        })
                            .then(response => {
                                if (response.ok) {
                                    // Powiadomienie zostało pomyślnie usunięte, możesz wykonać odpowiednie akcje, np. odświeżyć listę powiadomień
                                    warningModal.style.display = 'block';
                                    modalText1.textContent = `Administrator został prawidłowo usunięty`;

                                } else {
                                    console.error('Wystąpił błąd podczas usuwania administratora');
                                }
                            })
                            .catch(error => {
                                errorModal.style.display = 'block';
                                modalText.textContent = `Błąd podczas usuwania administratora: ${error.message}`;
                            });

                        closeModal();

                    }
                    cancelBtn.onclick = closeModal; // Zamknij modal po anulowaniu
                });

                adminList.appendChild(adminItem);

            }

        })
        .catch(error => console.error('Błąd pobierania danych projektu:', error));
});