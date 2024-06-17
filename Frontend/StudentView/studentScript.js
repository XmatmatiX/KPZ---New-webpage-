"use strict"

const token = sessionStorage.getItem("JWT");

function checkRole()
{
    const token = sessionStorage.getItem("JWT");
            fetch("http://127.0.0.1:8000/User/Role", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                 },
                }).then(response => {
                    if (!response.ok) {
                        if (response.status === 401)
                        {
                            window.location.href = "../LoginPage.html";
                            throw new Error('Not authorized');
                        }
                        else
                            throw new Error('Network response was not ok');
                    }
                    return response.json();
                }).then(data => {
                    if (data === "admin" )
                        window.location.href = "../landingPage.html";
                }).catch(error => {
                    console.error('Error:', error);
                });
}

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









