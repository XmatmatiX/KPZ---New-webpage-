function getReservatinDate()
{
    const enrollmentTime = document.getElementById("date");
    console.log("test");
      fetch(`http://127.0.0.1:8000/TimeReservation`)
        .then(response => response.json())
        .then(data => {

            const datetime = new Date(data['datatime']);
            const formattedDate = datetime.toLocaleString('default', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
            });

            enrollmentTime.textContent = formattedDate;

        })
        .catch(error => {
            console.log(error);
        });
}