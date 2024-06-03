"use strict"

document.addEventListener("DOMContentLoaded", function() {
    // Odczytanie ID projektu z adresu URL
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('id');

    const errorModal = document.getElementById('errorModal');
    const modalText = errorModal.querySelector('.textModal p');
    const closeButton2 = document.querySelector('#errorModal .close');
    const confirmButton2 = document.getElementById('confButton');

    closeButton2.addEventListener('click', function() {
        errorModal.style.display = 'none';
    });

    confirmButton2.addEventListener('click', function() {
        errorModal.style.display = 'none';
    });

    const warningModal = document.getElementById('warningModal');
    const modalText1 = warningModal.querySelector('.textModal p');
    const closeButton1 = document.querySelector('#warningModal .close');
    const confirmButton1 = document.getElementById('confButton1');

    closeButton1.addEventListener('click', function() {
        window.location.href = `topicsView.html`;
    });

    confirmButton1.addEventListener('click', function() {
        window.location.href = `topicsView.html`;
    });

    const deleteModal = document.getElementById('deleteAdmin');
    const closeButton = document.getElementById('closeButton');
    const cancelButton = document.getElementById('cancelButton');
    const confirmButton = document.getElementById('confirmButton');

    closeButton.addEventListener('click', function() {
        deleteModal.style.display = 'none';
    });

    cancelButton.addEventListener('click', function() {
        deleteModal.style.display = 'none';
    });

    confirmButton.addEventListener('click', function() {

        fetch(`http://127.0.0.1:8000/Admin/DeleteProject/${projectId}`, {
            method: 'DELETE'
        })
            .then(response => {
                if (response.ok) {
                    warningModal.style.display = 'block';
                    modalText1.textContent = `Temat został prawidłowo usunięty`;
                } else {
                    console.error('Wystąpił błąd podczas próby usunięcia tematu');
                }
            })
            .catch(error => {
                errorModal.style.display = 'block';
                modalText.textContent = `Błąd podczas usuwania tematu: ${error.message}`;
            });

        deleteModal.style.display = 'none';
    });

    // Pobranie szczegółów projektu za pomocą endpointu /Project/{id}
    fetch(`http://127.0.0.1:8000/Admin/Project/${projectId}`)
        .then(response => response.json())
        .then(projectData => {

            const projectDetailsElement = document.getElementById('topicHeader');
            projectDetailsElement.innerHTML = `
                <img class="logo" src="../Images/logo.png" alt="There should be a logo here">
                <p class="companyName">${projectData.companyname}</p>
                <button id="deleteTopicButton">USUŃ TEMAT</button>
            `;

            const deleteTopicButton = document.getElementById('deleteTopicButton');

            deleteTopicButton.addEventListener('click', function() {
                deleteModal.style.display = 'block';
            });

            //<p>${projectData.logopath}</p>
            const personDetails = document.getElementById('person')
            personDetails.innerHTML = `
                <p>Imię i Nazwisko</p>
                <p class="contact">${projectData.person}</p>
            `;
            const emailDetails = document.getElementById('email')
            emailDetails.innerHTML = `
                <p>Email</p>
                <p class="contact">${projectData.email}</p>
            `;
            const phoneDetails = document.getElementById('phone')
            phoneDetails.innerHTML = `
                <p>Numer telefonu</p>
                <p class="contact">${projectData.phonenumber}</p>
            `;

            const minGroupSize = projectData.mingroupsize;
            const maxGroupSize = projectData.maxgroupsize;
            const englishValue = projectData.englishgroup;

            const language = englishValue ? "Tak" : "Nie";

            // Sprawdź, czy minGroupSize i maxGroupSize są takie same
            const groupSizeText = minGroupSize === maxGroupSize ? minGroupSize : `${minGroupSize} - ${maxGroupSize}`;

            const topicDetails = document.getElementById('topicDetails')
            topicDetails.innerHTML = `
                <p class="topicName">${projectData.projecttitle}</p>
                <pre class="topicDescription">${projectData.description}</pre>
                 ${projectData.cooperationtype ? `
                    <p class="topicLabel">Planowane formy współpracy:</p>
                    <p class="details">${projectData.cooperationtype}</p>` : ''}
                <div class="someDetails">
                    <p class="topicLabel2">Akceptowana wielkość grup:</p>
                    <p class="details2">${groupSizeText}</p>
                </div>
                
                ${englishValue !== null ? `
                <div class="someDetails">
                    <p class="topicLabel2">Język angielski jako dopuszczalny język:</p>
                    <p class="details2">${language}</p>
                </div>` : ''}
                <div class="someDetails">
                    <p class="topicLabel2">Liczba grup:</p>
                    <p class="details2">${projectData.groupnumber}</p>
                </div>
                ${projectData.technologies ? `
                    <p class="topicLabel">Technologie:</p>
                    <p class="details">${projectData.technologies}</p>` : ''}
                ${projectData.remarks ? `
                    <p class="topicLabel">Dodatkowe uwagi:</p>
                    <p class="details">${projectData.remarks}</p>` : ''}
            `;

        })
        .catch(error => console.error('Błąd pobierania danych projektu:', error));
});