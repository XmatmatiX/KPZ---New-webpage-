"use strict"

document.addEventListener("DOMContentLoaded", function() {

    const urlParams = new URLSearchParams(window.location.search);
    const groupId = urlParams.get('id');

    fetch(`http://127.0.0.1:8000/Admin/${groupId}/Notification`)
        .then(response => response.json())
        .then(data => {

            console.log("Szczegoly")
            console.log(data)

            // const notifications = document.getElementById('notificationList');
            //
            // data.forEach((notification, index) => {
            //     const notificationItem = document.createElement('div');
            //     notificationItem.classList.add('notificationItem');
            //
            //     const dateTime = new Date(notification.datatime);
            //     const formattedDateTime = `${dateTime.toLocaleDateString()} ${dateTime.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}`;
            //
            //     notificationItem.style.fontWeight = notification.displayed ? 'normal' : 'bold';
            //
            //     notificationItem.innerHTML = `
            //         <p>${notification.groupid}</p>
            //         <p>${notification.content}</p>
            //         <p>${formattedDateTime}</p>
            //         <button class="searchButton"> <img src="../Images/trash.png" alt="Here should be a photo"> </button>
            //     `;
            //
            //     notificationItem.addEventListener('click', function() {
            //         // Przekierowanie użytkownika do strony notificationDetails.html z ID powiadomienia w adresie URL
            //         window.location.href = `notificationDetails?id=${notification.historyid}`;
            //     });
            //
            //     notifications.appendChild(notificationItem);
            // });
        })
        .catch(error => console.error('Błąd pobierania danych:', error));
});