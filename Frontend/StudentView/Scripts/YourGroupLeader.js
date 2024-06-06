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

        fetch(`https://projekty.kpz.pwr.edu.pl/api/Student/${userId}/Group/GuardianChange/${name}/${surname}/${email}`, {
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
            // ewentualnie aktualizacja
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
            alert('Failed to change guardian');
        });
    });

        function fetchGroupDetails(groupId) {
        fetch(`https://projekty.kpz.pwr.edu.pl/api/Student/Group/${groupId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log(data); // Log data to see its structure
                updateMemberDetails(data.members); // Assume `members` is directly under `data`
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
    fetchGroupDetails(1);
});

document.getElementById('file').addEventListener('click', function() {
    document.getElementById('fileModal').style.display = 'block';
});

document.addEventListener('DOMContentLoaded', function() {
    const userId = 62; // Replace with the actual user ID

    // Function to upload PDF
    async function uploadFiles() {
        const fileInput = document.getElementById('fileInput');
        const pdfFile = fileInput.files;

        if (!pdfFile) {
            alert('Proszę wybrać plik PDF');
            return;
        }

        const formData = new FormData();
         for (let i = 0; i < files.length; i++) {
        formData.append('files[]', files[i]);
        }
         fetch(`https://projekty.kpz.pwr.edu.pl/api/Student/${userId}/PDF_file`, {
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
            const response = await fetch(`https://projekty.kpz.pwr.edu.pl/api/Student/${userId}/PDF_file`, {
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
            const response = await fetch(`https://projekty.kpz.pwr.edu.pl/api/Student/${userId}/PDF_file`, {
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
document.getElementById('send').addEventListener('click', function() {
    alert('Plik został wysłany do zatwierdzenia.');
});