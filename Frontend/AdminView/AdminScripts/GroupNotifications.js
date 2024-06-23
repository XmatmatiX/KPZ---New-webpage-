"use strict"

const token = sessionStorage.getItem("JWT");
document.addEventListener("DOMContentLoaded", function() {

    const urlParams = new URLSearchParams(window.location.search);
    const groupId = urlParams.get('id');

    const errorModal = document.getElementById('errorModal');
    const modalText = errorModal.querySelector('.textModal p');
    const closeButton = document.querySelector('#errorModal .close');
    const confirmButton = document.getElementById('confButton');

    const warningModal = document.getElementById('warningModal');
    const modalText1 = warningModal.querySelector('.textModal p');
    const closeButton1 = document.querySelector('#warningModal .close');
    const confirmButton1 = document.getElementById('confButton1');

    closeButton.addEventListener('click', function() {
        errorModal.style.display = 'none';
    });

    confirmButton.addEventListener('click', function() {
        errorModal.style.display = 'none';
    });

    closeButton1.addEventListener('click', function() {
        warningModal.style.display = 'none';
        location.reload();
    });

    confirmButton1.addEventListener('click', function() {
        warningModal.style.display = 'none';
        location.reload();
    });

    var clearButton = document.getElementById("clearButton");

    clearButton.addEventListener("click", function() {
        var modal = document.getElementById('deleteHistoryModal');

        // elementy do zamykania modalu
        var span = document.getElementById("closeButton");
        var confirmBtn = document.getElementById("confirmButton");
        var cancelBtn = document.getElementById("cancelButton");

        function closeModal() {
            modal.style.display = "none";
        }

        // Przypisanie obsługi zdarzeń do przycisków
        modal.style.display = "block";
        span.onclick = closeModal;
        confirmBtn.onclick = function() {

            fetch(`http://127.0.0.1:8000/Admin/${groupId}/Notification`, {
                method: 'DELETE',
                headers: {
                    "Authorization": `Bearer ${token}`
                 }
            })
                .then(response => {
                    if (response.ok) {
                        // Powiadomienie zostało pomyślnie usunięte, możesz wykonać odpowiednie akcje, np. odświeżyć listę powiadomień
                        console.log('Historia powiadomień została pomyślnie usunięta');
                        warningModal.style.display = 'block';
                        modalText1.textContent = `Historia powiadomień została pomyślnie usunięta`;
                    } else {
                        console.error('Wystąpił błąd podczas usuwania historii powiadomień');
                    }
                })
                .catch(error => {
                    errorModal.style.display = 'block';
                    modalText.textContent = `Wystąpił błąd: ${error.message}`;
                });

            closeModal();
        }
        cancelBtn.onclick = closeModal;
    });
});

document.addEventListener("DOMContentLoaded", function() {

    const urlParams = new URLSearchParams(window.location.search);
    const groupId = urlParams.get('id');

    const errorModal = document.getElementById('errorModal');
    const modalText = errorModal.querySelector('.textModal p');
    const closeButton = document.querySelector('#errorModal .close');
    const confirmButton = document.getElementById('confButton');

    const warningModal = document.getElementById('warningModal');
    const modalText1 = warningModal.querySelector('.textModal p');
    const closeButton1 = document.querySelector('#warningModal .close');
    const confirmButton1 = document.getElementById('confButton1');

    closeButton.addEventListener('click', function() {
        errorModal.style.display = 'none';
    });

    confirmButton.addEventListener('click', function() {
        errorModal.style.display = 'none';
    });

    closeButton1.addEventListener('click', function() {
        warningModal.style.display = 'none';
        location.reload();
    });

    confirmButton1.addEventListener('click', function() {
        warningModal.style.display = 'none';
        location.reload();
    });

    fetch(`http://127.0.0.1:8000/Admin/${groupId}/Notification`, {
                    headers: {
                    "Authorization": `Bearer ${token}`
                 }
                })
        .then(response => response.json())
        .then(data => {

            const notifications = document.getElementById('notificationList');
            //const notificationDetails = document.getElementById('notificationDetails');

            data.forEach((notification) => {

                const notificationSection = document.createElement('section');
                notificationSection.classList.add('notificationSection');

                const notificationItem = document.createElement('div');
                notificationItem.classList.add('notificationGroupItem');

                const dateTime = new Date(notification.datatime);
                const formattedDateTime = `${dateTime.toLocaleDateString()} ${dateTime.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}`;

                notificationItem.style.fontWeight = notification.displayed ? 'normal' : 'bold';

                notificationItem.innerHTML = `
                    <p>${notification.content}</p>
                    <p>${formattedDateTime}</p>
                    <button class="searchButton"> <img src="../Images/trash.png" alt="Here should be a photo"> </button>
                `;

                notificationSection.appendChild(notificationItem);
                const notificationDetails = document.createElement('div');
                notificationDetails.classList.add('notificationDetails');

                // Notification Details

                notificationSection.appendChild(notificationDetails);
                notificationItem.addEventListener('click', function() {

                    event.stopPropagation();

                    fetch(`http://127.0.0.1:8000/Admin/Notification/${notification.historyid}`, {
                    headers: {
                    "Authorization": `Bearer ${token}`
                 }
                })
                        .then(response => response.json())
                        .then(details => {
                            // Wyświetl szczegóły powiadomienia w elemencie notificationDetails
                            displayNotificationDetails(notificationDetails, details);
                            toggleNotificationDetails(notificationDetails);
                            notificationItem.classList.toggle('active');

                        })
                        .catch(error => console.error('Błąd pobierania danych:', error));
                });

                // Dodaj obsługę zdarzenia kliknięcia na przycisku smietnika
                notificationItem.querySelector('.searchButton').addEventListener('click', function(event) {

                    event.stopPropagation();

                    var modal = document.getElementById('deleteModal');

                    // elementy do zamykania modalu
                    var span = document.getElementsByClassName("close")[0];
                    var confirmBtn = document.getElementById("confirmBtn");
                    var cancelBtn = document.getElementById("cancelBtn");

                    function closeModal() {
                        modal.style.display = "none";
                    }

                    // Przypisanie obsługi zdarzeń do przycisków
                    modal.style.display = "block";
                    span.onclick = closeModal;
                    confirmBtn.onclick = function() {

                        fetch(`http://127.0.0.1:8000/Admin/Notification/${notification.historyid}`, {
                            method: 'DELETE',
                            headers: {
                                "Authorization": `Bearer ${token}`
                            }
                        })
                            .then(response => {
                                if (response.ok) {
                                    // Powiadomienie zostało pomyślnie usunięte, możesz wykonać odpowiednie akcje, np. odświeżyć listę powiadomień
                                    console.log('Powiadomienie zostało pomyślnie usunięte');
                                    warningModal.style.display = 'block';
                                    modalText1.textContent = `Powiadomienie zostało pomyślnie usunięte`;

                                    // Tutaj możesz dodać kod do odświeżenia listy powiadomień
                                } else {
                                    console.error('Wystąpił błąd podczas usuwania powiadomienia');
                                }
                            })
                            .catch(error => {
                                console.error('Błąd usuwania powiadomienia:', error)
                                errorModal.style.display = 'block';
                                modalText.textContent = `Błąd usuwania powiadomienia: ${error.message}`;
                            });

                        closeModal();
                    }
                    cancelBtn.onclick = closeModal; // Zamknij modal po anulowaniu
                });

                notifications.appendChild(notificationSection);
            });

            function toggleNotificationDetails(notificationDetails) {
                // Sprawdzenie aktualnego stanu widoczności szczegółów
                const isVisible = notificationDetails.style.display === 'block';
                // Przełączenie widoczności szczegółów
                notificationDetails.style.display = isVisible ? 'none' : 'block';
            }

            function displayNotificationDetails(notificationDetails, details) {
                // Tutaj dostosuj sposób wyświetlania danych szczegółowych powiadomienia
                // np. ustawiając odpowiednie wartości innerHTML w elemencie notificationDetails
                notificationDetails.innerHTML = `
                    <p>${details.content}</p>
                `;
            }
        })
        .catch(error => console.error('Błąd pobierania danych:', error));
});