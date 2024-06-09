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
    var searchButton = document.getElementById("searchButton");

    searchButton.addEventListener("click", function() {
        window.location.href = "topicsView.html.html";
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
    var topics = document.getElementById("topicsStudent");

    topics.addEventListener("click", function() {
        window.location.href = "topicsView.html";
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const groupButton = document.getElementById('groupButton');

    if (groupButton) {
        groupButton.addEventListener('click', function() {
            window.location.href = 'yourGroup.html';
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
    fetch('https://projekty.kpz.pwr.edu.pl/api/ProjectList')
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
    //const signInButton = document.querySelector('button[onclick="id()"]'); // the sign-in button
    const signInButton = document.getElementById('EnrollButton'); // the sign-in button
    const errorMessage = document.getElementById('errorId');
    const successMessage = document.getElementById('successId');

    const userId=822; // NA STALE NA RAZIE JEST <- KEYCLOAK zmieni

    // Initially hide messages
    errorMessage.style.display = 'Nie udało się zapisac na ten temat';
    successMessage.style.display = 'Udało się zapisać!';

    signInButton.addEventListener('click', function() {
        // Mock condition: check if the input value is "123"
        const topicId = enrollButton.value;
        console.log(topicId);
        const input=`http://127.0.0.1:8000/Student/${userId}/Enroll/${topicId}`;
        console.log(input);
        let status=200;
        fetch(`https://projekty.kpz.pwr.edu.pl/api/Student/${userId}/Enroll/${topicId}`,{method: 'POST'})
            .then(response => {
                status=response.status;
                // if (!response.ok) {
                //     errorMessage.style.display = 'block';
                //     successMessage.style.display = 'none';
                // }
                return response.json();
            })
            .then(data => {
                if (status!==200)
                {
                    console.log(data.detail);
                    errorMessage.textContent=data.detail;
                    errorMessage.style.display = 'block';
                    successMessage.style.display = 'none';
                }
                else
                {
                    successMessage.style.display = 'block';
                    errorMessage.style.display = 'none';
                }


        });
        // if (topicId === '123') {
        //     // Display success message if topic ID is '123'
        //     successMessage.style.display = 'block';
        //     errorMessage.style.display = 'none';
        // } else {
        //     // Display error message if topic ID is not '123'
        //     errorMessage.style.display = 'block';
        //     successMessage.style.display = 'none';
        // }
    });
});
/*student in group*/
document.addEventListener('DOMContentLoaded', function() {
    const leaveGroupButton = document.querySelector('.leave-group');
    const leaveButton = document.getElementById('leaveButton');

    leaveButton.addEventListener('click', function() {
        const confirmation = confirm('Czy na pewno chcesz opuścić grupę?');
        if (confirmation) {
            console.log('Użytkownik opuścił grupę.');
            window.location.href = "enrollment.html";
            location.reload(); // Odświeżenie bieżącej strony
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

const logo = document.querySelector('.logoImage');

logo.addEventListener('click', () => {
    window.location.href = 'studentHome.html'; // Przenieś użytkownika na stronę główną
});

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









