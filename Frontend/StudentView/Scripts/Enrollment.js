const token = sessionStorage.getItem("JWT");

document.addEventListener('DOMContentLoaded', function() {
    const enrollButton = document.getElementById('EnrollButton');
    if (enrollButton) {
        enrollButton.addEventListener('click', function() {
            const topicInput = document.getElementById("idTopic");

            let project_id = topicInput.value;

            if(project_id==="")
                alert("Podaj temat");
            else {
                fetch(`http://127.0.0.1:8000/Student/Enroll/${project_id}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        "Authorization": `Bearer ${token}`
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
                      window.location.href = 'groupRedirect.html';
                })
                .catch(error => {
                    alert('Wystąpił błąd: ' + error.message);
                });
            }



        });
    }
});