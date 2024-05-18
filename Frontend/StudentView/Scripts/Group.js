document.addEventListener("DOMContentLoaded", function() {
    // Pobierz ID studenta z URL lub ustaw domyślnie
    const studentId = new URLSearchParams(window.location.search).get('id') || 'default_student_id';

    // Funkcja do pobierania danych o grupie studenta
    function fetchGroupDetails(studentId) {
        fetch(`http://127.0.0.1:8000/Student/Group/${studentId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                displayGroupDetails(data);
            })
            .catch(error => {
                console.error('Error fetching group details:', error);
                document.getElementById('group-info').innerHTML = '<p>Nie udało się pobrać danych grupy.</p>';
            });
    }

    // Funkcja do wyświetlania szczegółów grupy na stronie
    function displayGroupDetails(data) {
        const groupInfo = document.getElementById('group-info');
        groupInfo.innerHTML = `
            <h2>Informacje o grupie</h2>
            <p><strong>Kod zaproszenia:</strong> ${data.invite_code}</p>
            <p><strong>Rozmiar grupy:</strong> ${data.group_size}</p>
            <h3>Opiekun grupy</h3>
            <p><strong>Imię i nazwisko:</strong> ${data.guardian_info.guardian_name || 'Brak'}</p>
            <p><strong>Email:</strong> ${data.guardian_info.guardian_email || 'Brak'}</p>
            <h3>Członkowie grupy</h3>
            ${data.members.map(member => `<p>${member.name} ${member.surname} - ${member.role}</p>`).join('')}
            <h3>Projekt</h3>
            <p><strong>Firma:</strong> ${data.contact_info.company || 'Brak'}</p>
            <p><strong>Status:</strong> ${data.contact_info.status || 'Brak'}</p>
            <p><strong>Email kontaktowy:</strong> ${data.contact_info.contact_email || 'Brak'}</p>
            <p><strong>Telefon kontaktowy:</strong> ${data.contact_info.contact_phone || 'Brak'}</p>
            <p><strong>Jesteś liderem:</strong> ${data.is_leader ? 'Tak' : 'Nie'}</p>
        `;
    }

    // Wywołanie funkcji do pobrania danych
    fetchGroupDetails(studentId);
});
