document.addEventListener('DOMContentLoaded', function() {
    const baseUrl = 'http://127.0.0.1:8000';  // Zaktualizuj, jeśli masz inną bazę URL
    const usersContainer = document.querySelector('.group-members');

    fetch(`${baseUrl}/Student/ChangeLeader/${userId}`)
        .then(response => {
            if (!response.ok) throw new Error('Failed to fetch users');
            return response.json();
        })
        .then(users => {
            users.forEach(user => {
                const userElement = document.createElement('div');
                userElement.className = 'member';
                userElement.innerHTML = `
                    <input type="checkbox" name="member" value="${user.id}">
                    ${user.name} ${user.surname} (${user.rolename})
                `;
                usersContainer.appendChild(userElement);
            });
        })
        .catch(error => console.error('Error:', error));
});
document.getElementById('nominateButton').addEventListener('click', () => {
    const selectedUser = document.querySelector('input[name="member"]:checked');
    if (!selectedUser) {
        alert('Please select a user to nominate as leader.');
        return;
    }
    const userId = selectedUser.value;

    fetch(`${baseUrl}/Student/ChangeLeader/${userId}`, {
        method: 'PUT'
    })
    .then(response => {
        if (!response.ok) throw new Error('Failed to change leader');
        return response.json();
    })
    .then(data => {
        alert(data.message); // "Leader changed successfully"
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error changing leader: ' + error.message);
    });
});
