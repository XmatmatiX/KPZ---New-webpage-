"use strict"

function register() {

    const inputPassword = document.getElementById("password");
    const inputPassword2 = document.getElementById("password2");
    const inputEmail = document.getElementById("email");
    const inputName = document.getElementById("name");
    const inputSurname=document.getElementById("surname");

    let valuePassword = inputPassword.value;
    let valuePassword2 = inputPassword2.value;
    let email = inputEmail.value;
    let name=inputName.value;
    let surname=inputSurname.value;

    if(valuePassword==="" || valuePassword2==="")
        alert("Nie podano hasla")
    else if (valuePassword!==valuePassword2)
        alert("Hasła powinny być takie same!")
    else if(name==="" || surname==="" || email==="")
        alert("Podaj wszytskie wartości")

    else if(!email.endsWith("pwr.edu.pl"))
        alert("Jesteś z poza organzacji. Nie możesz się zarejestrować!")
    else
    {
        const newUser = {
            email: email,
            password: valuePassword,
            name: name,
            surname: surname
        }

        // console.log(newUser)
        fetch(`http://127.0.0.1:8000/Register`,{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newUser)
        })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(error => {
                        //   console.log(error.detail);
                        alert(error.detail)
                        throw new Error(error.detail);
                    });

                }
                return response.json();
            })
            .then(data => {
                sessionStorage.setItem("JWT", data.access_token);
                alert('Udało się stworzyć użytkownika!');
                redirectToHomePage();
                //window.location.href = 'loginPage.html';
            })
            .catch(error => alert('Błąd pobierania danych:', error.message));

    }

}

document.addEventListener("DOMContentLoaded", function() {

    var registerButton = document.getElementById("registerBtn");
    var inputPassword = document.getElementById("password2");

    registerButton.addEventListener("click", function() {
        register();
    });

    document.addEventListener("keydown", function(event) {
        if (event.key === 'Enter') {
            register();
        }
    })
})