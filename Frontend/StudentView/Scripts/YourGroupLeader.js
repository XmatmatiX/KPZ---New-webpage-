document.addEventListener('DOMContentLoaded', function() {
    const formModal = document.getElementById('formModal');
    const fileModal = document.getElementById('fileModal');
    const tutorButton = document.getElementById('tutor');
    const leaveButton = document.getElementById('leaveButton');
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
            // ewentualnie aktualizacja
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
            alert('Failed to change guardian');
        });
    });


    // Add more JavaScript code here if needed for file upload or other functionalities
});
