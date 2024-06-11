"use strict"

function openModal(projectID) {

    const span = document.getElementById("closeButton3");
    const confirmButton = document.getElementById("upload");
    const modal = document.getElementById('fileModal');
    const closeButton = document.querySelector('#fileModal .close');

    const pdfUpload = document.getElementById('pdf-upload');
    const fileName = document.getElementById('file-name');
    const fileLabel = document.getElementById("fileLabel")
    const removeFileButton = document.getElementById('remove-file');
    const warningInput = document.getElementById("noFile")

    function closeModal() {
        modal.style.display = "none";
        warningInput.style.display = 'none';
    }

    function close() {
        modal.style.display = "none";
        warningInput.style.display = 'none';
    }

    span.onclick = close;

    modal.style.display = "block";
    closeButton.onclick = closeModal;

    fileLabel.addEventListener('click', function() {
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

    confirmButton.addEventListener('click', function() {

        const fileInput = document.getElementById('pdf-upload');
        const file = fileInput.files[0];

        if (!file) {
            warningInput.style.display = 'block';
            return;
        }

        const formData = new FormData();
        formData.append('logo_file', file);

        fetch(`https://projekty.kpz.pwr.edu.pl/api/Admin/${projectID}/Logo`, {
            method: 'PUT',
            body: formData
        })
            .then(response => {
                if (response.ok) {
                    return response.json().then(data => {
                        // errorModal.style.display = 'block';
                        // modalText.textContent = `Prawidłowo załadowano logo`;
                        console.log("Prawidłowo załadowano logo")
                        location.reload();
                    });
                } else {
                    return response.json().then(data => {
                        // let errorMsg = data.detail || 'Wystąpił błąd podczas próby załadowania pliku';
                        // if(data.error === "409: File already exists. If you want to replace it, please delete and upload a new one.") {
                        //     errorMsg = "409: Plik został już załadowany. Jeżeli chcesz go zmienić, musisz najpierw usunąć aktualny plik"
                        // }
                        // else if (data.error) {
                        //     errorMsg = data.error;
                        // }
                        //
                        // errorModal.style.display = 'block';
                        // modalText.textContent = `${errorMsg}`;
                        console.log(data)
                    });
                }
            })
            .catch(error => {
                // errorModal.style.display = 'block';
                // modalText.textContent = `Błąd podczas ładowania pliku: ${error.message}`;
                console.log("Błąd podczas ładowania pliku", error.message)
            });

        modal.style.display = "block";
        // location.reload();
    })

}

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

        fetch(`https://projekty.kpz.pwr.edu.pl/api/Admin/DeleteProject/${projectId}`, {
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
    fetch(`https://projekty.kpz.pwr.edu.pl/api/Admin/Project/${projectId}`)
        .then(response => response.json())
        .then(projectData => {

            const projectDetailsElement = document.getElementById('topicHeader');
            let logoHTML = '';
            if (projectData.logopath === null) {
                logoHTML = 'BRAK';
            } else {
                logoHTML = `<img class="logo" src="../../../Backend/${projectData.logopath}" alt="There should be a photo">`;
            }

            projectDetailsElement.innerHTML = `
                ${logoHTML}
                <p class="companyName">${projectData.companyname}</p>
                <button id="uploadLogo">ZAŁADUJ LOGO</button>
                <button id="deleteTopicButton">USUŃ TEMAT</button>
            `;

            const deleteTopicButton = document.getElementById('deleteTopicButton');

            deleteTopicButton.addEventListener('click', function() {
                deleteModal.style.display = 'block';
            });

            const uploadLogo = document.getElementById("uploadLogo")

            uploadLogo.addEventListener('click', function() {
                openModal(projectId);
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