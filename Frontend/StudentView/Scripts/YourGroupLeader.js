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
    const searchButton = document.getElementById('searchGroupButton');
    searchButton.addEventListener('click', function(event) {
        event.preventDefault();
        const groupIdInput = document.getElementById('groupIdInput');

        if (!groupIdInput) {
            console.error('Input element for group ID not found');
            return;
        }

        const groupId = groupIdInput.value;
        if (!groupId) {
            alert('Proszę wpisać ID studnta.');
            return;
        }

        fetchGroupDetails(groupId);
    });

    function fetchGroupDetails(groupId) {
        fetch(`http://127.0.0.1:8000/Student/Group/${groupId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log(data); // Log data to see its structure
                updateMemberDetails(data.members); // Assume `members` is directly under `data`
                updateProjectDetails(data); // Pass the whole data object if it contains all needed info
            })
            .catch(error => {
                console.error('Błąd pobierania danych:', error);
                alert(`Nie udało się pobrać danych grupy: ${error.message}`);
            });
    }

    function updateMemberDetails(members) {
        const memberDetailsContainer = document.getElementById('member-details');
        if (memberDetailsContainer) {
            let membersHtml = '<h7>Członkowie grupy</h7>';
            members.forEach(member => {
                membersHtml += `
                        <div id="${member.role}" class="member" data-role="${member.role}">
                            <img src="../Images/Vector.jpg" alt="Avatar studenta">
                            <p>${member.name} ${member.surname} - ${member.role} <br>${member.email}</br></p>
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
        if (projectDetailsContainer) {
            projectDetailsContainer.innerHTML = `
                <p><strong>Kod zaproszenia:</strong> ${data.invite_code || 'Brak'}</p>
                <p><strong>Rozmiar grupy:</strong> ${data.group_size || 'Brak'}</p>
                <h7>Opiekun grupy</h7>
                <p><strong>Imię i nazwisko:</strong> ${data.guardian_info?.guardian_name || 'Brak'}</p>
                <p><strong>Email:</strong> ${data.guardian_info?.guardian_email || 'Brak'}</p>
                <h7>Projekt</h7>
                <p><strong>Firma:</strong> ${data.contact_info?.company || 'Brak'}</p>
                <p><strong>Status projektu:</strong> ${data.reservation_status || 'Brak'}</p>
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

        const userId = prompt('Wprowadź swoje ID studenta (lidera):');
        if (!userId) {
            alert('ID studenta jest wymagane.');
            return;
        }

        const name = document.getElementById('imie').value;
        const surname = document.getElementById('nazwisko').value;
        const email = document.getElementById('email').value;


        fetch(`http://127.0.0.1:8000/Student/${userId}/Group/GuardianChange/${name}/${surname}/${email}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({})
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            alert(data.message);
            formModal.style.display = 'none';
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
            alert('Failed to change guardian');
        });

             function fetchGroupDetails(groupId) {
        fetch(`http://127.0.0.1:8000/Student/Group/${groupId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log(data);
                updateMemberDetails(data.member_get);
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
                membersHtml += `
                    <div class="member">
                        <img src="../Images/Vector.jpg" alt="Avatar studenta">
                        <p>${member.name} ${member.surname} - ${member.role}</p>
                    </div>
                `;
            });
            memberDetailsContainer.innerHTML = membersHtml;
        } else {
            console.error('Member details container not found');
        }
    }
    fetchGroupDetails(userId);
    });

document.getElementById('file').addEventListener('click', function() {
    document.getElementById('fileModal').style.display = 'block';
});

document.addEventListener('DOMContentLoaded', function() {
    const userId = document.getElementById('groupIdInput').value;
     if (userId) {
            fetchGroupMembers(userId);
        } else {
            alert('Please enter a student ID.');
        }

    // Function to upload PDF
    async function uploadFiles() {
        const fileInput = document.getElementById('fileInput');
        const pdfFile = fileInput.files;

         // Walidacja, czy dane opiekuna zostały wypełnione
        if (!guardianNameInput.value || !guardianSurnameInput.value || !guardianEmailInput.value) {
            alert('Wszystkie dane opiekuna muszą być uzupełnione.');
            return;
        }


        if (!pdfFile) {
            alert('Proszę wybrać plik PDF');
            return;
        }

        const formData = new FormData();
         for (let i = 0; i < files.length; i++) {
        formData.append('files[]', files[i]);
        }
         fetch(`http://127.0.0.1:8000/Student/${userId}/PDF_file`, {
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

    // Function to delete all PDF files
    async function deleteFile() {
        if (!confirm('Czy na pewno chcesz usunąć wszystkie pliki?')) {
            return;
        }

        try {
            const response = await fetch(`http://127.0.0.1:8000/Student/${userId}/PDF_file`, {
                method: 'DELETE'
            });

            const data = await response.json();
            if (response.ok) {
                alert(data.message);
            } else {
                alert('Błąd: ' + data.detail);
            }
        } catch (error) {
            console.error('Wystąpił błąd:', error);
            alert('Wystąpił błąd: ' + error.message);
        }
    }

    // Function to get the list of PDF files
    async function getPDFList() {
        try {
            const response = await fetch(`http://127.0.0.1:8000/Student/${userId}/PDF_file`, {
                method: 'GET'
            });

            const data = await response.json();
            if (response.ok) {
                const fileListDiv = document.getElementById('fileList');
                fileListDiv.innerHTML = '<p>' + data.message + '</p><ul>' + data.files.map(file => `<li>${file}</li>`).join('') + '</ul>';
            } else {
                alert('Błąd: ' + data.detail);
            }
        } catch (error) {
            console.error('Wystąpił błąd:', error);
            alert('Wystąpił błąd: ' + error.message);
        }
    }
    // Expose functions to the global scope
    window.uploadFiles = uploadFiles;
    window.deleteFile = deleteFile;
    window.getPDFList = getPDFList;
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
    function fetchGroupMembers(studentId) {
        fetch(`http://127.0.0.1:8000/Student/Group/${studentId}`)
            .then(response => response.json())
            .then(data => {
                console.log(data);
                leaderForm.innerHTML = '';  // Wyczyść formularz przed dodaniem nowych elementów
                data.members.forEach(member => {
                    console.log(member.role);
                    const role = member.role;
                    const div = document.createElement('div');
                    div.innerHTML = `
                        <label id="${member.role}" class="member" data-role="${member.role}">
                            <input type="radio" name="leader" value="${member.id}">
                            <img src="../Images/Vector.jpg" alt="Avatar studenta">
                            <p>${member.name} ${member.surname} - ${member.role}</p>
                        </label>
                    `;
                    leaderForm.appendChild(div);
                });
            })
            .catch(error => {
                console.error('Error fetching group members:', error);
                alert('Failed to load group members');
            });
    }