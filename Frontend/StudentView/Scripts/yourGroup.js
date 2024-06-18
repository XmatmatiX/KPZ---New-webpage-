document.addEventListener("DOMContentLoaded", function() {
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
            alert('Proszę wpisać ID grupy.');
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
                <h7>Opiekun grupy</h7>
                <p><strong>Kod zaproszenia:</strong> ${data.invite_code || 'Brak'}</p>
                <p><strong>Rozmiar grupy:</strong> ${data.group_size || 'Brak'}</p>
                <p><strong>Imię i nazwisko:</strong> ${data.guardian_info?.guardian_name || 'Brak'}</p>
                <p><strong>Email:</strong> ${data.guardian_info?.guardian_email || 'Brak'}</p>
                <h7>Projekt</h7>
                <p><strong>Firma:</strong> ${data.contact_info?.company || 'Brak'}</p>
                <p><strong>Status projektu:</strong> ${data.contact_info?.status || 'Brak'}</p>
                <p><strong>Email kontaktowy:</strong> ${data.contact_info?.contact_email || 'Brak'}</p>
                <p><strong>Telefon kontaktowy:</strong> ${data.contact_info?.contact_phone || 'Brak'}</p>
            `;
        } else {
            console.error('Project details container not found');
        }
    }
});
document.addEventListener('DOMContentLoaded', function() {
    const unsubscribeButton = document.getElementById('leaveButton');

    // Funkcja do rezygnacji z grupy
    function leaveGroup() {
        const studentId = document.getElementById('groupIdInput').value;
        console.log(studentId);
        fetch(`http://127.0.0.1:8000/Student/unsubscribe/${studentId}`, {
            method: 'POST',
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
              window.location.href = 'enrollment.html';
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
            alert('Failed to unsubscribe from the group');
        });
    }

    // Dodaj nasłuchiwacz zdarzeń do przycisku "Opuść grupę"
    unsubscribeButton.addEventListener('click', leaveGroup);
});

document.addEventListener('DOMContentLoaded', function() {
    const changeButton = document.getElementById('change');
    if (changeButton) {
        changeButton.addEventListener('click', function() {
            window.location.href = 'changeLeader.html';
        });
    }
});

// function translateRole(role) {
//     switch(role) {
//         case 'leader':
//             return 'Lider';
//         case 'student':
//             return 'Student';
//         default:
//             return 'Nieznany';
//     }
// }
//
// function translateStatus(state) {
//     switch(state) {
//         case 'available':
//             return 'Dostępny';
//         case 'reserved':
//             return 'Zarezerwowany';
//         case 'taken':
//             return 'Zajęty';
//         case 'confirmed':
//             return 'Zatwierdzony';
//         case 'waiting':
//             return 'Oczekujący na zatwierdzenie';
//         default:
//             return 'Nieznany';
//     }
// }
//
// document.addEventListener("DOMContentLoaded", function() {
//
//     const urlParams = new URLSearchParams(window.location.search);
//     const groupId = urlParams.get('id');
//
//     fetch(`http://127.0.0.1:8000/Student/Group/${groupId}`)
//             .then(response => {
//                 if (!response.ok) {
//                     throw new Error(`HTTP error! Status: ${response.status}`);
//                 }
//                 return response.json();
//             })
//             .then(data => {
//
//                 const themaDetails = document.getElementById('thema')
//                 const projectInfo = data['project-info'];
//
//                 const thema = projectInfo.project_title || 'BRAK';
//                 themaDetails.innerHTML = `
//                     <p>Temat</p>
//                     <p class="group">${thema}</p>
//                 `;
//
//                 const projectDetails = document.getElementById('projectId')
//                 const id = projectInfo.project_id || 'BRAK';
//                 projectDetails.innerHTML = `
//                     <p>ID Projektu</p>
//                     <p class="group">${id}</p>
//                 `;
//
//                 const companyInfo = data['contact_info'];
//
//                 const companyDetails = document.getElementById('company')
//                 const company = companyInfo.company || 'BRAK';
//                 companyDetails.innerHTML = `
//                     <p>Firma</p>
//                     <p class="group">${company}</p>
//                 `;
//
//                 const guardianInfo = data['guardian_info'];
//                 const guardianDetails = document.getElementById('guardian')
//                 const guardian = guardianInfo.guardian_name || 'BRAK';
//                 const guardianEmail = guardianInfo.guardian_email || 'BRAK';
//                 guardianDetails.innerHTML = `
//                     <p>Prowadzący</p>
//                     <p class="group">${guardian}, email: ${guardianEmail}</p>
//                 `;
//
//                 const stateDetails = document.getElementById('state')
//                 const status = data['reservation-status'];
//                 const translatdeStatus = translateStatus(status);
//                 stateDetails.innerHTML = `
//                     <p>Status</p>
//                     <p class="group">${translatdeStatus}</p>
//                 `;
//
//                 const codeDetails = document.getElementById('code')
//                 codeDetails.innerHTML = `
//                     <p>Kod grupy</p>
//                     <p class="group">${data.invite_code}</p>
//                 `;
//
//                 const contactDetails = data['contact_info'];
//                 const person = contactDetails.person || 'BRAK';
//                 const personDetails = document.getElementById('person')
//                 personDetails.innerHTML = `
//                     <p>Imię i Nazwisko</p>
//                     <p class="group">${person}</p>
//                 `;
//
//                 const email = contactDetails.contact_email || 'BRAK';
//                 const emailDetails = document.getElementById('email')
//                 emailDetails.innerHTML = `
//                     <p>Email</p>
//                     <p class="group">${email}</p>
//                 `;
//
//                 const phone = contactDetails.contact_phone || 'BRAK';
//                 const phoneDetails = document.getElementById('phone')
//                 phoneDetails.innerHTML = `
//                     <p>Telefon</p>
//                     <p class="group">${phone}</p>
//                 `;
//
//                 const students = document.getElementById('studentGroupList');
//
//                 const members = data['members'];
//
//                 members.forEach(member => {
//                     const memberItem = document.createElement('div');
//                     memberItem.classList.add('studentGroupItem')
//
//                     const roleClass = member.rolename === 'leader' ? 'leader' : 'student';
//                     memberItem.classList.add('studentGroupItem', roleClass);
//
//                     const translatdeRole = translateRole(member.role);
//
//                     memberItem.innerHTML = `
//                     <p>${member.email}</p>
//                     <p>${member.name}</p>
//                     <p>${member.surname}</p>
//                     <p>${translatdeRole}</p>
//                 `;
//
//                     students.appendChild(memberItem)
//                 });
//
//             })
//             .catch(error => {
//                 console.error('Błąd pobierania danych:', error);
//                 alert(`Nie udało się pobrać danych grupy: ${error.message}`);
//             });
//
// });