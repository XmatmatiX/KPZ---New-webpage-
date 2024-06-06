"use strict"

document.addEventListener("DOMContentLoaded", function() {

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

    fetch('http://127.0.0.1:8000/api/Admin/Notification')
        .then(response => response.json())
        .then(data => {

            const notifications = document.getElementById('notificationList');

            data.forEach((notification) => {

                const notificationSection = document.createElement('section');
                notificationSection.classList.add('notificationSection');

                const notificationItem = document.createElement('div');
                notificationItem.classList.add('notificationItem');

                const dateTime = new Date(notification.date);
                const formattedDateTime = `${dateTime.toLocaleDateString()} ${dateTime.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}`;

                //notificationItem.style.fontWeight = notification.displayed ? 'normal' : 'bold';

                //console.log("Not disp")
                //console.log(notification.displayed)

                if (!notification.displayed) {
                    notificationItem.style.fontWeight = 'bold';
                }
                else {
                    notificationItem.style.fontWeight = 'normal';
                }

                notificationItem.innerHTML = `
                    <p>${notification.group}</p>
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

                    fetch(`http://127.0.0.1:8000/api/Admin/Notification/${notification.historyid}`)
                        .then(response => response.json())
                        .then(details => {

                            if (!notification.displayed) {
                                notificationItem.style.fontWeight = 'normal';
                            }

                            // Wyświetl szczegóły powiadomienia w elemencie notificationDetails
                            displayNotificationDetails(notificationDetails, details);
                            toggleNotificationDetails(notificationDetails);
                            notificationItem.classList.toggle('active');
                            //notificationDetails.classList.toggle('activeDetails');
                        })
                        .catch(error => {
                            errorModal.style.display = 'block';
                            modalText.textContent = `Błąd pobierania danych: ${error.message}`;
                        });
                });

                // Dodaj obsługę zdarzenia kliknięcia na przycisku smietnika
                notificationItem.querySelector('.searchButton').addEventListener('click', function(event) {

                    event.stopPropagation();

                    const modal = document.getElementById('deleteModal');

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

                        fetch(`http://127.0.0.1:8000/api/Admin/Notification/${notification.historyid}`, {
                            method: 'DELETE'
                        })
                            .then(response => {
                                if (response.ok) {
                                    // Powiadomienie zostało pomyślnie usunięte, możesz wykonać odpowiednie akcje, np. odświeżyć listę powiadomień
                                    console.log('Powiadomienie zostało pomyślnie usunięte');
                                    location.reload();
                                    // Tutaj możesz dodać kod do odświeżenia listy powiadomień
                                } else {
                                    console.error('Wystąpił błąd podczas usuwania powiadomienia');
                                }
                            })
                            .catch(error => {
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
        .catch(error => {
            errorModal.style.display = 'block';
            modalText.textContent = `Błąd pobierania danych: ${error.message}`;
        });
});