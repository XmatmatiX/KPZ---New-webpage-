"use strict"

document.addEventListener("DOMContentLoaded", function() {

    const submitButton = document.getElementById('addTopicButton');
    const warningModal = document.getElementById('warningModal');
    const modalText = warningModal.querySelector('.textModal p');
    const closeButton = document.querySelector('#warningModal .close');
    const confirmButton = document.getElementById('confirmBtn');

    closeButton.addEventListener('click', function() {
        warningModal.style.display = 'none';
    });

    confirmButton.addEventListener('click', function() {
        warningModal.style.display = 'none';
    });

    submitButton.addEventListener('click', async function(event) {

        event.preventDefault();

        const requiredFields = [
            document.getElementById('companyname'),
            document.getElementById('projecttitle'),
            document.getElementById('email'),
            document.getElementById('phonenumber'),
            document.getElementById('description'),
            document.getElementById('person'),
            document.getElementById('mingroupsize'),
            document.getElementById('maxgroupsize'),
            document.getElementById('groupnumber'),
            document.getElementById('englishgroup')
        ];
        let allValid = true;

        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                field.classList.add('invalid');
                allValid = false;
            } else {
                field.classList.remove('invalid');
            }
        });

        if (!allValid) {
            warningModal.style.display = 'block';
            modalText.textContent = `Wszystkie wymagane pola muszą zostać uzupełnione`;
            return;
        }

        const data = {
            companyname: document.getElementById('companyname').value,
            projecttitle: document.getElementById('projecttitle').value,
            email: document.getElementById('email').value,
            phonenumber: document.getElementById('phonenumber').value,
            description: document.getElementById('description').value,
            logopath: document.getElementById('logopath').value,
            technologies: document.getElementById('technologies').value,
            mingroupsize: parseInt(document.getElementById('mingroupsize').value, 10),
            maxgroupsize: parseInt(document.getElementById('maxgroupsize').value, 10),
            groupnumber: parseInt(document.getElementById('groupnumber').value, 10),
            englishgroup: document.getElementById('englishgroup').value,
            remarks: document.getElementById('remarks').value,
            cooperationtype: document.getElementById('cooperationtype').value,
            person: document.getElementById('person').value
        };

        if (isNaN(data.groupnumber) || isNaN(data.mingroupsize) || isNaN(data.maxgroupsize)) {
            warningModal.style.display = 'block';
            modalText.textContent = `Pola liczbowe (rozmiar grupy oraz ilość grup) muszą zawierać poprawne wartości liczbowe`;
            return;
        }

        try {
            const response = await fetch('http://127.0.0.1:8000/Admin/AddProject', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || response.statusText);
            }

            const result = await response.json();
            warningModal.style.display = 'block';
            modalText.textContent = `Projekt został prawidłowo dodany`;
        } catch (error) {
            warningModal.style.display = 'block';
            modalText.textContent = `Wystąpił błąd podczas dodawania projektu: ${error.message}`;
        }

    });

});