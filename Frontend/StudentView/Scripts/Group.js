document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById('searchForm');

    if (!form) {
        console.error('Form element not found');
        return;
    }

    form.addEventListener('submit', function(event) {
        event.preventDefault();
        const groupId = document.getElementById('groupId').value;

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
                const groupInfo = document.getElementById('group-info');
                if (!groupInfo) {
                    console.error('Element #group-info nie istnieje w DOM');
                    return;
                }

                console.log("Dane");
                console.log(data);

                const { contact_info, guardian_info, members, invite_code, group_size } = data;
                let membersHtml = members.map(member =>
                    `<p>${member.name} ${member.surname} - ${member.role}</p>`
                ).join('');

                groupInfo.innerHTML = `
                    <h1>Informacje o grupie</h1>
                    <p><strong>Kod zaproszenia:</strong> ${invite_code}</p>
                    <p><strong>Rozmiar grupy:</strong> ${group_size}</p>
                    <h3>Opiekun grupy</h3>
                    <p><strong>Imię i nazwisko:</strong> ${guardian_info.guardian_name || 'Brak'}</p>
                    <p><strong>Email:</strong> ${guardian_info.guardian_email || 'Brak'}</p>
                    <h3>Członkowie grupy</h3>
                    ${membersHtml}
                    <h3>Projekt</h3>
                    <p><strong>Firma:</strong> ${contact_info.company || 'Brak'}</p>
                    <p><strong>Status projektu:</strong> ${contact_info.status || 'Brak'}</p>
                    <p><strong>Email kontaktowy:</strong> ${contact_info.contact_email || 'Brak'}</p>
                    <p><strong>Telefon kontaktowy:</strong> ${contact_info.contact_phone || 'Brak'}</p>
                `;
            })
            .catch(error => {
                console.error('Błąd pobierania danych:', error);
                groupInfo.innerHTML = `<p>Nie udało się pobrać danych grupy: ${error.message}</p>`;
            });
    }
});
