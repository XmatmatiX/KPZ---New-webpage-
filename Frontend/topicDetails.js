"use strict"

document.addEventListener("DOMContentLoaded", function() {
    // Odczytanie ID projektu z adresu URL
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('id');

    const button = document.getElementById("backButton")

    button.addEventListener("click", function() {
        window.location.href = "landingPage.html";
    })

    fetch(`http://127.0.0.1:8000/Project/${projectId}`)
        .then(response => response.json())
        .then(projectData => {

            const projectDetailsElement = document.getElementById('topicHeader');

            let logoHTML = '';
            if (projectData.logo === null) {
                logoHTML = 'BRAK';
            } else {
                logoHTML = `<img class="logo" src="../../../Backend/${projectData.logo}" alt="There should be a photo">`;
            }

            projectDetailsElement.innerHTML = `
                ${logoHTML}
                <p class="companyName">${projectData.companyname}</p>
            `;

            //<p>${projectData.logopath}</p>

            const minGroupSize = projectData.minsize;
            const maxGroupSize = projectData.maxsize;
            const englishValue = projectData.language;
            const language = englishValue ? "Tak" : "Nie";

            // Sprawdź, czy minGroupSize i maxGroupSize są takie same
            const groupSizeText = minGroupSize === maxGroupSize ? minGroupSize : `${minGroupSize} - ${maxGroupSize}`;

            const topicDetails = document.getElementById('topicDetails')
            topicDetails.innerHTML = `
                <p class="topicName">${projectData.title}</p>
                <pre class="topicDescription">${projectData.description}</pre>
                 ${projectData.cooperationtype ? `
                    <p class="topicLabel">Planowane formy współpracy:</p>
                    <p class="details">${projectData.cooperationtype}</p>` : ''}
                <div class="someDetails">
                    <p class="topicLabel2">Akceptowana wielkość grup:</p>
                    <p class="details2">${groupSizeText}</p>
                </div>
                <div class="someDetails">
                    <p class="topicLabel2">Liczba grup:</p>
                    <p class="details2">${projectData.groupnumber}</p>
                </div>
                <div class="someDetails">
                    <p class="topicLabel2">Liczba zajętych grup:</p>
                    <p class="details2">${projectData.numertaken}</p>
                </div>
                
                ${englishValue !== null ? `
                <div class="someDetails">
                    <p class="topicLabel2">Język angielski jako dopuszczalny język:</p>
                    <p class="details2">${language}</p>
                </div>` : ''}
                
                ${projectData.technologies ? `
                    <p class="topicLabel">Technologie:</p>
                    <p class="details">${projectData.technologies}</p>` : ''}
                ${projectData.remarks ? `
                    <p class="topicLabel">Dodatkowe uwagi:</p>
                    <p class="details">${projectData.remarks}</p>` : ''}
            `;

        })
        .catch(error => console.error('Błąd pobierania danych projektu:', error));
});