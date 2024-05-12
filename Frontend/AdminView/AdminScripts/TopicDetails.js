"use strict"

document.addEventListener("DOMContentLoaded", function() {
    // Odczytanie ID projektu z adresu URL
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('id');
    console.log("Project id: ", projectId)

    // Pobranie szczegółów projektu za pomocą endpointu /Project/{id}
    fetch(`http://127.0.0.1:8000/Project/${projectId}`)
        .then(response => response.json())
        .then(projectData => {
            // Wyświetlenie szczegółów projektu na stronie
            const projectDetailsElement = document.getElementById('projectDetails');
            projectDetailsElement.innerHTML = `
                <h2>Szczegóły projektu:</h2>
                <p>Nazwa projektu: ${projectData.projecttitle}</p>
                <p>Nazwa firmy: ${projectData.companyname}</p>
                <!-- Dodaj inne szczegóły projektu tutaj -->
            `;
        })
        .catch(error => console.error('Błąd pobierania danych projektu:', error));
});