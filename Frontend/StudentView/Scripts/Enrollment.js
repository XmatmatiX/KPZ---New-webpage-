document.addEventListener('DOMContentLoaded', function() {
    const enrollButton = document.getElementById('EnrollButton');
    if (enrollButton) {
        enrollButton.addEventListener('click', function() {
            const studentInput = document.getElementById("idStudent");
            const topicInput = document.getElementById("idTopic");

            let user_id = studentInput.value;
            let project_id = topicInput.value;
            if(user_id==="")
                alert("Podaj studenta");
            else if(project_id==="")
                alert("Podaj temat");
            else {
                fetch(`http://127.0.0.1:8000/Student/${user_id}/Enroll/${project_id}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({})
                })
                .then(response => {
                    if (!response.ok) {
                        return response.json().then(data => {
                            throw new Error(data.detail);
                        });
                    }
                    return response.json(); // Jeśli odpowiedź jest 'ok', zwracamy JSON
                })
                .then(data => {
                    alert(data.message);
                      window.location.href = 'YourGroupLeader.html';
                })
                .catch(error => {
                    alert('Wystąpił błąd: ' + error.message);
                });
            }



        });
    }
});