"use strict"

function addButtonListener(studentItem, userId) {

    const groupButton = studentItem.querySelector('.groupButton');
    groupButton.addEventListener('click', function() {
        openModal(userId);
    });
}

function displayGroups(userID) {

    const groupList = document.getElementById('groupList');
    groupList.innerHTML = '';

    fetch('http://127.0.0.1:8000/Admin/Groups')
        .then(response => response.json())
        .then(data => {
            const groups = data['groups:']; // Pobranie tablicy projektów

            const groupids = groups['groupids'];
            const groupsize = groups['groupsize'];
            const projectTitles = groups['project_titles'];

            for (let i = 0; i < groupids.length; i++) {

                const groupItem = document.createElement('div');
                groupItem.classList.add('groupItem2');

                groupItem.innerHTML = `
                            <p>${groupids[i]}</p>
                            <p>${projectTitles[i]}</p>
                            <p>${groupsize[i]}</p>
                            <button class="searchButton">Wybierz</button>
                        `;

                const warningModal = document.getElementById('warningModal');
                const errorModal = document.getElementById('errorModal');
                const modalText = errorModal.querySelector('.textModal p');
                const closeButton = document.querySelector('#errorModal .close');
                const confirmButton = document.getElementById('confirmButton');

                closeButton.addEventListener('click', function() {
                    errorModal.style.display = 'none';
                });

                confirmButton.addEventListener('click', function() {
                    errorModal.style.display = 'none';
                });

                const selectButton = groupItem.querySelector('.searchButton');
                selectButton.addEventListener('click', function() {

                    console.log('Wybrano user:', userID);
                    console.log('Wybrano grupę:', groupids[i]);

                    fetch(`http://127.0.0.1:8000/Admin/SignToGroup/${userID}${groupids[i]}`, {
                        method: 'POST'
                    })
                        .then(response => {
                            if (!response.ok) {
                                throw new Error('The squad of a group with reservation can not be changed');
                            }

                            warningModal.style.display = 'block';

                            displayGroups(userID);
                            return response.json();

                        })
                        .catch(error => {
                            errorModal.style.display = 'block';
                            modalText.textContent = `Wystąpił błąd: ${error.message}`;
                        });
                });

                groupList.appendChild(groupItem);
            }

        })
        .catch(error => console.error('Błąd pobierania danych:', error));
}

function openModal(userID) {

    const span = document.getElementById("closeButton");

    const modal = document.getElementById('groupModal');
    const closeButton = document.querySelector('#warningModal .close');
    const confirmButton = document.getElementById('confirmBtn');
    const groupList = document.getElementById('groupList');

    function closeModal() {
        modal.style.display = "none";
        groupList.innerHTML = '';
        location.reload();
    }

    function close() {
        modal.style.display = "none";
        groupList.innerHTML = '';
    }

    span.onclick = close;

    modal.style.display = "block";
    closeButton.onclick = closeModal;
    confirmButton.onclick = closeModal;

    displayGroups(userID);

}

function allStudents(students) {
    fetch(`http://127.0.0.1:8000/Admin/Students`)
        .then(response => response.json())
        .then(data => {

            const emails = data['emails'];
            const groups = data['groups'];
            const ids = data['ids'];
            const names = data['names'];
            const surnames = data['surnames'];

            // Iteracja przez wszystkich studentów
            for (let i = 0; i < emails.length; i++) {
                const studentItem = document.createElement('div');
                studentItem.classList.add('studentItem');

                // const groupContent = groups[i] !== null ? groups[i] : `<button class="groupButton">Przypisz grupę</button>`;
                const groupContent = groups[i] !== null ? groups[i] : `BRAK`;

                // Utworzenie HTML dla pojedynczego projektu
                studentItem.innerHTML = `
                    <p>${emails[i]}</p>
                    <p>${names[i]}</p>
                    <p>${surnames[i]}</p>
                    <p>${groupContent}</p>
                `;

                // Dodanie nasłuchiwania zdarzenia kliknięcia na każdy element topicItemAdmin
                // studentItem.addEventListener('click', function() {
                //     // Przekierowanie użytkownika do widoku reservationDetails, przekazując ID projektu jako parametr w adresie URL
                //     window.location.href = `reservationDetails.html?id=${projecstid[i]}`;
                // });

                // const groupButton = studentItem.querySelector('.groupButton');
                // if (groupButton) {
                //     // Dodanie nasłuchiwania zdarzenia kliknięcia tylko gdy istnieje element .groupButton
                //     addButtonListener(studentItem, ids[i]);
                // }
                students.appendChild(studentItem);
            }

        })
        .catch(error => console.error('Błąd pobierania danych:', error));
}

function freeStudents(students) {
    fetch(`http://127.0.0.1:8000/Admin/FreeStudents`)
        .then(response => response.json())
        .then(details => {

            const studentList = details["students:"];

            students.innerHTML = '';

            // Dodanie elementu borderStudents2 ponownie
            const borderElement = document.createElement('div');
            borderElement.classList.add('borderStudents2');
            borderElement.innerHTML = `
                <p>Email</p>
                <p>Imię</p>
                <p>Nazwisko</p>
                <p>Grupa</p>
            `;
            students.appendChild(borderElement);

            studentList.forEach(student => {

                const studentItem = document.createElement('div');
                studentItem.classList.add('studentItem');

                //const groupContent = groups[i] !== null ? groups[i] : ``;

                studentItem.innerHTML = `
                    <p>${student.email}</p>
                    <p>${student.name}</p>
                    <p>${student.surname}</p>
<!--                    <button class="groupButton">Przypisz grupę</button>-->
                    <p>BRAK</p>
                `;

                //addButtonListener(studentItem, student.userid);
                students.appendChild(studentItem);

            });

        })
        .catch(error => console.error('Błąd pobierania danych:', error));
}

function displaySearchedStudents(students, searchData) {
    students.innerHTML = ''; // Wyczyść listę studentów przed wyświetleniem nowych wyników

    // Dodanie elementu borderStudents2 ponownie
    const borderElement = document.createElement('div');
    borderElement.classList.add('borderStudents2');
    borderElement.innerHTML = `
         <p>Email</p>
         <p>Imię</p>
         <p>Nazwisko</p>
         <p>Grupa</p>
    `;
    students.appendChild(borderElement);

    const emails = searchData['emails'];
    const groups = searchData['groups'];
    const ids = searchData['ids'];
    const names = searchData['names'];
    const surnames = searchData['surnames'];

    for (let i = 0; i < emails.length; i++) {

        const studentItem = document.createElement('div');
        studentItem.classList.add('studentItem');

        // const groupContent = groups[i] !== null ? groups[i] : `<button class="groupButton">Przypisz grupę</button>`;
        const groupContent = groups[i] !== null ? groups[i] : `BRAK`;

        // Utworzenie HTML dla pojedynczego projektu
        studentItem.innerHTML = `
            <p>${emails[i]}</p>
            <p>${names[i]}</p>
            <p>${surnames[i]}</p>
            <p>${groupContent}</p>
        `;

        // const groupButton = studentItem.querySelector('.groupButton');
        // if (groupButton) {
        //     // Dodanie nasłuchiwania zdarzenia kliknięcia tylko gdy istnieje element .groupButton
        //     addButtonListener(studentItem, ids[i]);
        // }
        students.appendChild(studentItem);
    }
}

document.addEventListener("DOMContentLoaded", function() {

    const students = document.getElementById('studentList');
    const freeCheckbox = document.getElementById('freeCheckbox');
    const searchStudent = document.getElementById('findStudent');
    const studentInput = document.getElementById('studentSearch');

    allStudents(students)

    freeCheckbox.addEventListener('change', function() {
        // Sprawdź, czy checkbox jest zaznaczony
        if (this.checked) {

            freeStudents(students)

        } else {
            students.innerHTML = ''; // Wyczyść listę studentów przed wyświetleniem nowych wyników

            // Dodanie elementu borderStudents2 ponownie
            const borderElement = document.createElement('div');
            borderElement.classList.add('borderStudents2');
            borderElement.innerHTML = `
                 <p>Email</p>
                 <p>Imię</p>
                 <p>Nazwisko</p>
                 <p>Grupa</p>
            `;
            students.appendChild(borderElement);
            allStudents(students)
        }

    });

    function searching() {

        const studentInput = document.getElementById('studentSearch')
        const student = studentInput.value;

        if(student === '') {
            students.innerHTML = ''; // Wyczyść listę studentów przed wyświetleniem nowych wyników

            // Dodanie elementu borderStudents2 ponownie
            const borderElement = document.createElement('div');
            borderElement.classList.add('borderStudents2');
            borderElement.innerHTML = `
                 <p>Email</p>
                 <p>Imię</p>
                 <p>Nazwisko</p>
                 <p>Grupa</p>
            `;
            students.appendChild(borderElement);
            allStudents(students);
        }
        else {
            fetch(`http://127.0.0.1:8000/Admin/SearchStudent/${student}`, {
                method: 'POST'
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    displaySearchedStudents(students, data);
                })
                .catch(error => console.error('Błąd pobierania danych:', error));
        }
    }

    searchStudent.addEventListener("click", function() {
        searching();
    });

    studentInput.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            searching();
        }
    });
});