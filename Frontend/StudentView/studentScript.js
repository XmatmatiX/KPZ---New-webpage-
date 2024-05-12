"use strict"

document.addEventListener("DOMContentLoaded", function() {
    // Pobierz przycisk "Wyloguj się"
    var logoutButton = document.getElementById("logout");

    // Dodaj nasłuchiwanie zdarzenia kliknięcia na przycisku "Wyloguj się"
    logoutButton.addEventListener("click", function() {
        // Przenieś użytkownika do strony landingPage.html
        window.location.href = "../landingPage.html";
    });
});

document.addEventListener("DOMContentLoaded", function() {
    // Pobierz przycisk "Wyloguj się"
    var homeButton = document.getElementById("homeButton");

    // Dodaj nasłuchiwanie zdarzenia kliknięcia na przycisku "Wyloguj się"
    homeButton.addEventListener("click", function() {
        // Przenieś użytkownika do strony landingPage.html
        window.location.href = "studentHome.html";
    });
});

document.addEventListener("DOMContentLoaded", function() {
    // Pobierz przycisk "Wyloguj się"
    var searchButton = document.getElementById("searchButton");

    // Dodaj nasłuchiwanie zdarzenia kliknięcia na przycisku "Wyloguj się"
    searchButton.addEventListener("click", function() {
        // Przenieś użytkownika do strony landingPage.html
        window.location.href = "freeGroups.html";
    });
});

document.addEventListener("DOMContentLoaded", function() {
    // Pobierz przycisk "Wyloguj się"
    var groupButton = document.getElementById("groupButton");

    // Dodaj nasłuchiwanie zdarzenia kliknięcia na przycisku "Wyloguj się"
    groupButton.addEventListener("click", function() {
        // Przenieś użytkownika do strony landingPage.html
        window.location.href = "yourGroup.html";
    });
});

document.addEventListener("DOMContentLoaded", function() {
    // Pobierz przycisk "Wyloguj się"
    var enrollmentButton = document.getElementById("enrollmentButton");

    // Dodaj nasłuchiwanie zdarzenia kliknięcia na przycisku "Wyloguj się"
    enrollmentButton.addEventListener("click", function() {
        // Przenieś użytkownika do strony landingPage.html
        window.location.href = "enrollment.html";
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const manageButton = document.getElementById('managePosition');

    if (manageButton) {
        manageButton.addEventListener('click', function() {
            window.location.href = 'changeLeader.html';
        });
    } else {
        console.log('Przycisk zarządzania stanowiskiem nie został znaleziony');
    }
});

document.addEventListener("DOMContentLoaded", function() {
    // Pobierz przycisk "Wyloguj się"
    var topics = document.getElementById("topicsStudent");

    // Dodaj nasłuchiwanie zdarzenia kliknięcia na przycisku "Wyloguj się"
    topics.addEventListener("click", function() {
        // Przenieś użytkownika do strony landingPage.html
        window.location.href = "topicsView.html";
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const groupButton = document.getElementById('groupButton');

    if (groupButton) {
        groupButton.addEventListener('click', function() {
            window.location.href = 'studentInGroup.html'; // Przekierowanie do strony changeLider.html
        });
    }
});
document.addEventListener('DOMContentLoaded', function() {
    const changeButton = document.getElementById('change');

    if (changeButton) {
        changeButton.addEventListener('click', function() {
            window.location.href = 'changeLeader.html'; // Przekierowanie do strony changeLider.html
        });
    }
});
document.addEventListener("DOMContentLoaded", function() {
    
    const homeButton = document.getElementById("signInHome");

    if(homeButton)
        {
            homeButton.addEventListener("click", function() {
                window.location.href = "../StudentView/enrollment.html";
            });
        }
});
// Project List

document.addEventListener("DOMContentLoaded", function() {
    // Pobranie danych z endpointa GET /ProjectList
    fetch('http://127.0.0.1:8000/ProjectList')
        .then(response => response.json())
        .then(data => {
            const topicList = document.getElementById('topicList');

            console.log("Dane")
            console.log(data)

            const projects = data['projects:']; // Pobranie tablicy projektów
            console.log("Projects")
            console.log(projects)

            // Generowanie nowych elementów HTML na podstawie danych z tokena
            projects.forEach(topic => {
                const topicItem = document.createElement('div');
                topicItem.classList.add('topicItem');

                // Ustalenie tekstu dla groupSize
                let groupMin = topic.mingroupsize;
                let groupMax = topic.maxgroupsize;
                if (groupMax === groupMin)
                {
                    topicItem.innerHTML = `
                        <p>${topic.logopath}</p>
                        <p>${topic.companyname}</p>
                        <p>${topic.projecttitle}</p>
                        <p>${topic.maxgroupsize}</p>
                        <p>${topic.groupnumber}</p>
                    `;
                }
                else {
                    topicItem.innerHTML = `
                        <p>${topic.logopath}</p>
                        <p>${topic.companyname}</p>
                        <p>${topic.projecttitle}</p>
                        <p>${topic.mingroupsize} - ${topic.maxgroupsize}</p>
                        <p>${topic.groupnumber}</p>
                    `;
                }

                // Dodanie nasłuchiwania zdarzenia kliknięcia na każdy element topicItem
                topicItem.addEventListener('click', function() {
                    // Wyświetlenie szczegółów tematu po kliknięciu
                    alert(`Szczegóły tematu:\n${topic.projecttitle}\n${topic.companyname}\nGroup Size: ${topic.mingroupsize} - ${topic.maxgroupsize}\nGroup Number: ${topic.groupnumber}`);
                });

                topicList.appendChild(topicItem);
            });
        })
        .catch(error => console.error('Błąd pobierania danych:', error));
});

document.addEventListener('DOMContentLoaded', () => {
    const signupButton = document.getElementById('signupButton');
    const confirmationMessage = document.getElementById('confirmationMessage');

    signupButton.addEventListener('click', () => {
        const topicID = document.getElementById('topicID').value;
        // Tutaj możesz dodać logikę wysyłania ID tematu do serwera
        // Na razie tylko wyświetlamy komunikat
        confirmationMessage.textContent = 'Zapisano na temat o ID: ' + topicID;
        confirmationMessage.style.backgroundColor = '#b3ffb3'; // zielone tło dla potwierdzenia
    });
});
document.addEventListener('DOMContentLoaded', function() {
    const enrollButton = document.getElementById('idTopic'); // the button for topic ID input
    const signInButton = document.querySelector('button[onclick="id()"]'); // the sign-in button
    const errorMessage = document.getElementById('errorId');
    const successMessage = document.getElementById('successId');

    // Initially hide messages
    errorMessage.style.display = 'Nie udało się zapisac na ten temat';
    successMessage.style.display = 'Udało się zapisać!';

    signInButton.addEventListener('click', function() {
        // Mock condition: check if the input value is "123"
        const topicId = enrollButton.value;
        if (topicId === '123') {
            // Display success message if topic ID is '123'
            successMessage.style.display = 'block';
            errorMessage.style.display = 'none';
        } else {
            // Display error message if topic ID is not '123'
            errorMessage.style.display = 'block';
            successMessage.style.display = 'none';
        }
    });
});
/*student in group*/
document.addEventListener('DOMContentLoaded', function() {
    const leaveGroupButton = document.querySelector('.leave-group');
    const leaveButton = document.getElementById('leaveButton');

    leaveButton.addEventListener('click', function() {
        const confirmation = confirm('Czy na pewno chcesz opuścić grupę?');
        if (confirmation) {
            // Tu wpisz logikę potrzebną do opuszczenia grupy, np. zapytanie AJAX do serwera
            console.log('Użytkownik opuścił grupę.');
            window.location.href = "enrollment.html";
            //location.reload(); // Odświeżenie bieżącej strony
        }
    });
});

/*student bez grupy*/
document.addEventListener("DOMContentLoaded", function() {
    const joinButton = document.querySelector(".join-btn");
    const createButton = document.querySelector(".create-btn");
    const joinGroupInput = document.querySelector(".option input[type='text']");
    const createGroupInput = document.querySelector(".option:nth-child(2) input[type='text']");

    joinButton.addEventListener("click", function() {
        const groupPassword = joinGroupInput.value.trim();
        if (groupPassword) {
            // Symulacja żądania AJAX
            fetch('/join-group', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ password: groupPassword })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        alert("Udało się dołączyć do grupy.");
                    } else {
                        alert("Nie udało się dołączyć do grupy: " + data.message);
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert("Wystąpił błąd podczas dołączania do grupy.");
                });
        } else {
            alert("Proszę podać hasło grupy.");
        }
    });

    createButton.addEventListener("click", function() {
        const groupName = createGroupInput.value.trim();
        if (groupName) {
            // Symulacja żądania AJAX
            fetch('/create-group', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name: groupName })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        alert("Grupa została utworzona.");
                    } else {
                        alert("Nie udało się utworzyć grupy: " + data.message);
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert("Wystąpił błąd podczas tworzenia grupy.");
                });
        } else {
            alert("Proszę podać nazwę grupy.");
        }
    });
});

document.getElementById('tutor').addEventListener('click', function() {
    document.getElementById('formModal').style.display = 'block';
});

document.getElementsByClassName('close')[0].onclick = function() {
    document.getElementById('formModal').style.display = 'none';
}

window.onclick = function(event) {
    var modal = document.getElementById('formModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}

function submitForm() {
    var imie = document.getElementById('imie').value;
    var nazwisko = document.getElementById('nazwisko').value;
    var email = document.getElementById('email').value;
    alert('Imię: ' + imie + '\nNazwisko: ' + nazwisko + '\nEmail: ' + email);
    document.getElementById('formModal').style.display = 'none';
}
document.getElementById('file').addEventListener('click', function() {
    document.getElementById('fileModal').style.display = 'block';
});

document.getElementsByClassName('close')[0].onclick = function() {
    document.getElementById('fileModal').style.display = 'none';
}

window.onclick = function(event) {
    var modal = document.getElementById('fileModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}
document.getElementById('openModal').addEventListener('click', function() {
    document.getElementById('fileModal').style.display = 'block';
});

document.getElementsByClassName('close')[0].onclick = function() {
    document.getElementById('fileModal').style.display = 'none';
}

window.onclick = function(event) {
    if (event.target === document.getElementById('fileModal')) {
        document.getElementById('fileModal').style.display = 'none';
    }
}
function deleteFile() {
    var fileInput = document.getElementById('fileInput');
    if (fileInput) {
        fileInput.value = ''; // Resetuje wybór plików
    }
}

function uploadFiles() {
    var fileInput = document.getElementById('fileInput');
    var files = fileInput.files;
    var formData = new FormData();

    // Dodaje pliki do obiektu FormData
    for (let i = 0; i < files.length; i++) {
        formData.append('files[]', files[i]);
    }

    // Opcje fetch do wysłania plików
    fetch('/upload', {  // Zakładam, że "/upload" to endpoint na Twoim serwerze
        method: 'POST',
        body: formData
    })
        .then(response => response.json())  // Oczekuje, że serwer zwróci JSON
        .then(data => {
            console.log('Success:', data);
            alert('Pliki zostały pomyślnie wysłane.');
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Wystąpił błąd podczas przesyłania plików.');
        });
}


function showModal() {
    const modal = document.getElementById('formModal');
    modal.style.display = 'block';

    const closeButton = modal.querySelector('.close');
    closeButton.onclick = function() {
        modal.style.display = 'none';
    }

    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    }
}

// Przycisk do otwierania modala
document.getElementById('join-btn').addEventListener('click', showModal);
document.getElementById('send').addEventListener('click', function() {
    alert('Plik został wysłany do zatwierdzenia.');
});
/*studentInGroup*/

function leaveGroup(groupName, leaderName) {
    document.getElementById('groupName').textContent = groupName;
    document.getElementById('leaderName').textContent = leaderName;
    document.getElementById('leaveModal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('leaveModal').style.display = 'none';
}

document.querySelector('.modal .close').addEventListener('click', closeModal);
openModal('Grupa XYZ', 'Jan Kowalski');

/*studentGroup*/
document.addEventListener("DOMContentLoaded", function() {
    // Identyfikator studenta, dla którego chcemy uzyskać informacje o grupie
    const studentId = '123'; // Załóżmy, że to jest nasz studentId

    // Funkcja do pobierania danych grupy studenta
    function fetchGroupDetails(studentId) {
        fetch(`http://127.0.0.1:8000/Student/Group/${studentId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                console.log('Group Details:', data);
                displayGroupDetails(data);
            })
            .catch(error => console.error('Error fetching group details:', error));
    }

    // Funkcja do wyświetlania szczegółów grupy na stronie
    function displayGroupDetails(data) {
        const groupInfo = document.getElementById('group-info');
        groupInfo.innerHTML = `<h2>Informacje o grupie</h2>
                                <p>Kod zaproszenia: ${data.invite_code}</p>
                                <p>Rozmiar grupy: ${data.group_size}</p>
                                <h3>Opiekun grupy:</h3>
                                <p>Imię i nazwisko: ${data.guardian_info.guardian_name ? data.guardian_info.guardian_name : 'Brak'}</p>
                                <p>Email: ${data.guardian_info.guardian_email ? data.guardian_info.guardian_email : 'Brak'}</p>
                                <h3>Członkowie grupy:</h3>`;
        data.members.forEach(member => {
            groupInfo.innerHTML += `<p>${member.name} ${member.surname} - ${member.role}</p>`;
        });
    }

    // Wywołanie funkcji
    fetchGroupDetails(studentId);
});

document.addEventListener("DOMContentLoaded", function() {
    const nominateButton = document.querySelector('.nominate-button');

    if (nominateButton) {
        nominateButton.addEventListener('click', () => {
            const checkboxes = document.querySelectorAll('.group-members input[type="checkbox"]');
            let newLeaderId = null;

            // Przejście przez wszystkie checkboxy i znalezienie zaznaczonego
            checkboxes.forEach((checkbox, index) => {
                if (checkbox.checked) {
                    // Załóżmy, że każdy checkbox ma atrybut `data-user-id` z ID użytkownika
                    newLeaderId = checkbox.getAttribute('data-user-id');
                }
            });

            if (newLeaderId) {
                changeLeader(newLeaderId);
            } else {
                alert('Proszę wybrać nowego lidera!');
            }
        });
    }

    // Funkcja do wysłania żądania zmiany lidera
    function changeLeader(newLeaderId) {
        const groupId = '123'; // Tutaj ustaw prawidłowe ID grupy
        fetch(`http://127.0.0.1:8000/Student/ChangeLeader/${newLeaderId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id_grupy: groupId })
        })
        .then(response => response.json())
        .then(data => {
            alert('Lider został zmieniony.');
            console.log(data);
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Nie udało się zmienić lidera.');
        });
    }
});

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('nominate').addEventListener('click', function() {
        alert('Został nadany lider grupy: ');
    });
});


