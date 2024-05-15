"use strict"

document.addEventListener("DOMContentLoaded", function() {
    // Odczytanie ID projektu z adresu URL
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('id');
    console.log("ID: ", projectId)

    fetch(`http://127.0.0.1:8000/Project/${projectId}`)
        .then(response => response.json())
        .then(projectData => {

            console.log("Project")
            console.log(projectData)

            const projectDetailsElement = document.getElementById('topicHeader');
            projectDetailsElement.innerHTML = `
                <img class="logo" src="Images/logo.png" alt="There should be a logo here">
                <p class="companyName">${projectData.companyname}</p>
            `;

            //<p>${projectData.logopath}</p>

            const minGroupSize = projectData.mingroupsize;
            const maxGroupSize = projectData.maxgroupsize;
            const englishValue = projectData.englishgroup;

            const language = englishValue ? "Tak" : "Nie";

            // Sprawdź, czy minGroupSize i maxGroupSize są takie same
            const groupSizeText = minGroupSize === maxGroupSize ? minGroupSize : `${minGroupSize} - ${maxGroupSize}`;

            const topicDetails = document.getElementById('topicDetails')
            topicDetails.innerHTML = `
                <p class="topicName">${projectData.projecttitle}</p>
                <p class="topicDescription">${projectData.description}</p>
                 ${projectData.cooperationtype ? `
                    <p class="topicLabel">Planowane formy współpracy:</p>
                    <p class="details">${projectData.cooperationtype}</p>` : ''}
                <div class="someDetails">
                    <p class="topicLabel2">Akceptowana wielkość grup:</p>
                    <p class="details2">${groupSizeText}</p>
                </div>
                
                ${englishValue !== null ? `
                <div class="someDetails">
                    <p class="topicLabel2">Język angielski jako dopuszczalny język:</p>
                    <p class="details2">${language}</p>
                </div>` : ''}
                <div class="someDetails">
                    <p class="topicLabel2">Liczba grup:</p>
                    <p class="details2">${projectData.groupnumber}</p>
                </div>
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