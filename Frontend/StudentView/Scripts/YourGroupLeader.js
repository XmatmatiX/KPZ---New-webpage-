const token = sessionStorage.getItem("JWT");

let guardianNameInput, guardianEmailInput

function translateRole(role) {
    switch(role) {
        case 'leader':
            return 'Lider';
        case 'student':
            return 'Student';
        default:
            return 'Nieznany';
    }
}

function translateStatus(state) {
    switch(state) {
        case 'available':
            return 'Dostępny';
        case 'reserved':
            return 'Zarezerwowany';
        case 'taken':
            return 'Zajęty';
        case 'confirmed':
            return 'Zatwierdzony';
        case 'waiting':
            return 'Oczekujący na zatwierdzenie';
        default:
            return 'Nieznany';
    }
}

function fetchGroupDetails() {
    fetch(`http://127.0.0.1:8000/Student/Group`, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            updateMemberDetails(data.members);
            updateProjectDetails(data); // Pass the whole data object if it contains all needed info
        })
        .catch(error => {
            console.error('Błąd pobierania danych:', error.message);
            alert(`Nie udało się pobrać danych grupy: ${error.message}`);
        });
}

function updateMemberDetails(members) {
    const memberDetailsContainer = document.getElementById('member-details');
    if (memberDetailsContainer) {
        let membersHtml = '<h7>Członkowie grupy</h7>';
        members.forEach(member => {

            const translatedRole = translateRole(member.role)

            membersHtml += `
                    <div class="member">
                        <img src="../Images/Vector.jpg" alt="Avatar studenta">
                        <p>${member.name} ${member.surname} - ${translatedRole}</p>
                    </div>
                `;
        });
        memberDetailsContainer.innerHTML = membersHtml;
    } else {
        console.error('Member details container not found');
    }
}

function updateProjectDetails(data) {
    const projectDetailsContainer = document.getElementById('project-details-div');

    const translatedStatus = translateStatus(data.reservation_status);

    if (projectDetailsContainer) {

        guardianNameInput = data.guardian_info.guardian_name
        guardianEmailInput = data.guardian_info.guardian_email

        projectDetailsContainer.innerHTML = `
                <p><strong>Kod zaproszenia:</strong> ${data.invite_code || 'Brak'}</p>
                <p><strong>Rozmiar grupy:</strong> ${data.group_size || 'Brak'}</p>
                <h7>Opiekun grupy</h7>
                <p><strong>Imię i nazwisko:</strong> ${data.guardian_info?.guardian_name || 'Brak'}</p>
                <p><strong>Email:</strong> ${data.guardian_info?.guardian_email || 'Brak'}</p>
                <h7>Projekt</h7>
                <p><strong>Firma:</strong> ${data.contact_info?.company || 'Brak'}</p>
                <p><strong>Status projektu:</strong> ${translatedStatus || 'Brak'}</p>
                <p><strong>Email kontaktowy:</strong> ${data.contact_info?.contact_email || 'Brak'}</p>
                <p><strong>Telefon kontaktowy:</strong> ${data.contact_info?.contact_phone || 'Brak'}</p>
                <p><strong>Osoba kontaktowa:</strong> ${data.contact_info?.person || 'Brak'}</p>
            `;
    } else {
        console.error('Project details container not found');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const formModal = document.getElementById('formModal');
    const fileModal = document.getElementById('fileModal');
    const tutorButton = document.getElementById('tutor');
    const closeButtons = document.querySelectorAll('.close');

    // Show the tutor modal
    tutorButton.addEventListener('click', function() {
        formModal.style.display = 'block';
    });

    // Hide modals when the close button is clicked
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            formModal.style.display = 'none';
            fileModal.style.display = 'none';
        });
    });
});

document.addEventListener('DOMContentLoaded', function() {

    fetchGroupDetails();

    function updateMemberDetails(members) {
        const memberDetailsContainer = document.getElementById('member-details');
        if (memberDetailsContainer) {
            let membersHtml = '<h7>Członkowie grupy</h7>';
            members.forEach(member => {

                const translatedRole = translateRole(member.role)

                membersHtml += `
                        <div id="${member.role}" class="member" data-role="${member.role}">
                            <img src="../Images/Vector.jpg" alt="Avatar studenta">
                            <p>${member.name} ${member.surname} - ${translatedRole} <br>${member.email}</br></p>
                        </div>
                `;
            });
            memberDetailsContainer.innerHTML = membersHtml;
        } else {
            console.error('Member details container not found');
        }
    }

    function updateProjectDetails(data) {
        const projectDetailsContainer = document.getElementById('project-details-div');

        const translatedStatus = translateStatus(data.reservation_status);

        if (projectDetailsContainer) {
            projectDetailsContainer.innerHTML = `
                <p><strong>Kod zaproszenia:</strong> ${data.invite_code || 'Brak'}</p>
                <p><strong>Rozmiar grupy:</strong> ${data.group_size || 'Brak'}</p>
                <h7>Opiekun grupy</h7>
                <p id="guardianInfo"><strong>Imię i nazwisko:</strong> ${data.guardian_info?.guardian_name || 'Brak'}</p>
                <p><strong>Email:</strong> ${data.guardian_info?.guardian_email || 'Brak'}</p>
                <h7>Projekt</h7>
                <p><strong>Firma:</strong> ${data.contact_info?.company || 'Brak'}</p>
                <p><strong>Status projektu:</strong> ${translatedStatus || 'Brak'}</p>
                <p><strong>Email kontaktowy:</strong> ${data.contact_info?.contact_email || 'Brak'}</p>
                <p><strong>Telefon kontaktowy:</strong> ${data.contact_info?.contact_phone || 'Brak'}</p>
                <p><strong>Osoba kontaktowa:</strong> ${data.contact_info?.person || 'Brak'}</p>
            `;
        } else {
            console.error('Project details container not found');
        }
    }
});


// Handle form submission for changing guardian
document.getElementById('opiekunForm').addEventListener('submit', function(event) {
    event.preventDefault();

    //const userId = prompt('Wprowadź swoje ID studenta (lidera):');
    //if (!userId) {
    //alert('ID studenta jest wymagane.');
    //return;
    //}

    const name = document.getElementById('imie').value;
    const surname = document.getElementById('nazwisko').value;
    const email = document.getElementById('email').value;

    fetch(`http://127.0.0.1:8000/Student/Group/GuardianChange/${name}/${surname}/${email}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({})
    }).then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    }).then(data => {
        alert(data.message);
        formModal.style.display = 'none';
    }).catch(error => {
        console.error('There was a problem with the fetch operation:', error);
        alert('Failed to change guardian');
    });

    fetchGroupDetails();
});

function getPDFList() {

    fetch(`http://127.0.0.1:8000/Student/Group`, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    })
        .then(response => response.json())
        .then(data => {
            if (data.detail) {
                console.log(data.detail);
            } else {

                fetch(`http://127.0.0.1:8000/Student/PDF_file`, {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                })
                    .then(response2 => response2.json())
                    .then(data2 => {
                        if (data2.detail) {
                            console.log(data2.detail);
                            if(data2.detail == "Nie odnaleziono folderu (ścieżki)") {
                                const fileList = document.getElementById('fileList');
                                fileList.innerHTML = '';
                                fileList.innerHTML = '<div class="noFiles">BRAK</div>';
                            }
                        } else {

                            const fileList = document.getElementById('fileList');
                            fileList.innerHTML = ''; // Czyścimy listę przed dodaniem nowych elementów

                            if (data2.files.length === 0) {
                                fileList.innerHTML = '<p>BRAK</p>';
                            } else {
                                fileList.innerHTML = '<ul>' + data2.files.map(file => `<li><a href="${file}" target="_blank">${file.split('/').pop()}</a></li>`).join('') + '</ul>';
                                fileList.innerHTML = '</p><ul>' + data2.files.map(file => `<li><a style="font-size: 18px;" href="../../Backend/docs/pdf/${data.group}/${file}" target="_blank">${file.split('/').pop()}</a></li>`).join('') + '</ul>';
                            }

                            // data.files.forEach(file => {
                            //     const fileDiv = document.createElement('div');
                            //     fileDiv.textContent = file;
                            //     fileList.appendChild(fileDiv);
                            // });
                        }
                    })
                    .catch(error2 => {
                        console.error('Error:', error2);
                        alert('Wystąpił błąd podczas przesyłania plików.');
                    });
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Wystąpił błąd podczas pobierania danych');
        });
}

function openModal() {

    const span = document.getElementById("closeButton3");
    const confirmButton = document.getElementById("upload");
    const deleteButton = document.getElementById("deleteFile");
    const modal = document.getElementById('fileModal');

    const closeButton = document.querySelector('#fileModal .close');

    const fileUpload = document.getElementById('file-upload');
    const fileName = document.getElementById('file-name');
    const fileLabel = document.getElementById("fileLabel")
    const removeFileButton = document.getElementById('remove-file');
    const warningInput = document.getElementById("noFile");
    const warningInput2 = document.getElementById("noGuardian")

    getPDFList()

    function closeModal() {
        modal.style.display = "none";
        warningInput.style.display = 'none';
        warningInput2.style.display = 'none';
    }

    function close() {
        modal.style.display = "none";
        warningInput.style.display = 'none';
        warningInput2.style.display = 'none';
    }

    span.onclick = close;

    modal.style.display = "block";
    closeButton.onclick = closeModal;

    fileLabel.addEventListener('click', function() {
        fileUpload.click();
    });

    fileUpload.addEventListener('change', () => {
        if (fileUpload.files.length > 0) {
            fileName.textContent = fileUpload.files[0].name;
            removeFileButton.style.display = 'inline';
        } else {
            fileName.textContent = 'Nie wybrano pliku';
            removeFileButton.style.display = 'none';
        }
    });

    removeFileButton.addEventListener('click', () => {
        fileUpload.value = '';
        fileName.textContent = 'Nie wybrano pliku';
        removeFileButton.style.display = 'none';
    })

    confirmButton.addEventListener('click', function() {

        const fileInput = document.getElementById('file-upload');
        const file = fileInput.files[0];

        // Walidacja, czy dane opiekuna zostały wypełnione
        if (!guardianNameInput || !guardianEmailInput) {
            warningInput2.style.display = 'block';
            return;
        }

        if (!file) {
            warningInput.style.display = 'block';
            return;
        }

        const formData = new FormData();
        formData.append('pdf_file', file);

        fetch(`http://127.0.0.1:8000/Student/PDF_file`, {
            method: 'POST',
            body: formData,
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })
            .then(response => response.json())  // Oczekuje, że serwer zwróci JSON
            .then(data => {
                console.log(data);
                if(data.detail) {
                    alert(data.detail)
                }
                else if(data.message) {
                    // alert(data.message)
                    // if(data.message === "Pomyślnie załadowano plik")
                    //     location.reload();
                    getPDFList();
                    fileUpload.value = '';
                    fileName.textContent = 'Nie wybrano pliku';
                    removeFileButton.style.display = 'none';
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Wystąpił błąd podczas przesyłania plików.');
            });
    })

    deleteButton.addEventListener('click', function() {

        if (!confirm('Czy na pewno chcesz usunąć plik?')) {
            return;
        }

        fetch(`http://127.0.0.1:8000/Student/PDF_file`, {
            method: 'DELETE',
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })
            .then(response => response.json())
            .then(data => {
                alert("Prawidłowo usunięto plik")
                getPDFList();
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Wystąpił błąd podczas usuwania pliku:' + error.message);
            });

    })

}

document.addEventListener('DOMContentLoaded', function() {

    const fileButton = document.getElementById('file');
    fileButton.addEventListener('click', function() {
        openModal();
    })
});
document.addEventListener('DOMContentLoaded', function() {
    const changeButton = document.getElementById('change');

    if (changeButton) {
        changeButton.addEventListener('click', function() {
            window.location.href = 'changeLeader.html';
        });
    }
});
/*
document.addEventListener('DOMContentLoaded', function() {
    const leaveButton = document.getElementById('leaveButton');

    if (leaveButton) {
        leaveButton.addEventListener('click', leaveGroup);
    }
});

function leaveGroup() {
    const confirmation = confirm('Czy na pewno chcesz opuścić grupę?');
    if (confirmation) {
        console.log('Użytkownik opuścił grupę.');
        window.location.href = "enrollment.html";
    }
}

 */

document.getElementById('send').addEventListener('click', function() {
    alert('Plik został wysłany do zatwierdzenia.');
});