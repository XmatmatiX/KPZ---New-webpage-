"use strict"

document.addEventListener("DOMContentLoaded", function() {
    // Pobranie danych z endpointa GET /ProjectList
    fetch('http://127.0.0.1:8000/Admin/Notification')
        .then(response => response.json())
        .then(data => {

            const notifications = document.getElementById('notificationList');
            //const notificationDetails = document.getElementById('notificationDetails');

            data.forEach((notification, index) => {

                const notificationSection = document.createElement('section');
                notificationSection.classList.add('notificationSection');

                const notificationItem = document.createElement('div');
                notificationItem.classList.add('notificationItem');

                // const notificationDetails = document.createElement('div');
                // notificationDetails.classList.add('notificationDetails');
                // notifications.appendChild(notificationDetails);

                const dateTime = new Date(notification.datatime);
                const formattedDateTime = `${dateTime.toLocaleDateString()} ${dateTime.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}`;

                notificationItem.style.fontWeight = notification.displayed ? 'normal' : 'bold';

                notificationItem.innerHTML = `
                    <p>${notification.groupid}</p>
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

                    fetch(`http://127.0.0.1:8000/Admin/Notification/${notification.historyid}`)
                        .then(response => response.json())
                        .then(details => {
                            console.log("Szczegoly")
                            console.log(details)

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
                            method: 'DELETE'
                        })
                            .then(response => {
                                if (response.ok) {
                                    // Powiadomienie zostało pomyślnie usunięte, możesz wykonać odpowiednie akcje, np. odświeżyć listę powiadomień
                                    console.log('Powiadomienie zostało pomyślnie usunięte');
                                    // Tutaj możesz dodać kod do odświeżenia listy powiadomień
                                } else {
                                    console.error('Wystąpił błąd podczas usuwania powiadomienia');
                                }
                            })
                            .catch(error => console.error('Błąd usuwania powiadomienia:', error));

                        closeModal();
                    }
                    cancelBtn.onclick = closeModal; // Zamknij modal po anulowaniu

                    //const isConfirmed = confirm("Czy na pewno chcesz usunąć tę wiadomość?");

                    // Jeśli użytkownik potwierdzi usunięcie
                    // if (isConfirmed) {
                    //     // Wywołaj zapytanie DELETE, aby usunąć powiadomienie
                    //     fetch(`http://127.0.0.1:8000/Admin/Notification/${notification.historyid}`, {
                    //         method: 'DELETE'
                    //     })
                    //         .then(response => {
                    //             if (response.ok) {
                    //                 // Powiadomienie zostało pomyślnie usunięte, możesz wykonać odpowiednie akcje, np. odświeżyć listę powiadomień
                    //                 console.log('Powiadomienie zostało pomyślnie usunięte');
                    //                 // Tutaj możesz dodać kod do odświeżenia listy powiadomień
                    //             } else {
                    //                 console.error('Wystąpił błąd podczas usuwania powiadomienia');
                    //             }
                    //         })
                    //         .catch(error => console.error('Błąd usuwania powiadomienia:', error));
                    // } else {
                    //     // Jeśli użytkownik anuluje usunięcie, nie wykonujemy żadnej akcji
                    //     console.log('Anulowano usuwanie powiadomienia');
                    // }



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