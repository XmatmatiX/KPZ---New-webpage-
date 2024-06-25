"use strict"

function login() {

    const inputLogin = document.getElementById("login");
    const inputPassword = document.getElementById("password");

    let valueLogin = inputLogin.value;
    let valuePassword = inputPassword.value;

    if(valueLogin === "" || valuePassword ==="")
    {
        const message = document.getElementById("errorLogin");
        message.style.display = "flex";
    }
    else
    {
        const userLogin = {
            email: valueLogin,
            password: valuePassword
        }

        fetch(`https://projekty.kpz.pwr.edu.pl/api/login`,{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userLogin)
        })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(error => {
                        throw new Error(error.detail); // rzucenie błędu z szczegółami
                    });
                }
                return response.json();
            })
            .then(data => {
                sessionStorage.setItem("JWT", data.access_token);
                redirectToHomePage();
            })
            .catch(error => alert('Błąd pobierania danych:', error));

    }
}

document.addEventListener("DOMContentLoaded", function() {

    var loginButton = document.getElementById("loginBtn");
    var inputPassword = document.getElementById("password");

    loginButton.addEventListener("click", function() {
        login();
    });

    inputPassword.addEventListener("keydown", function(event) {
        if (event.key === 'Enter') {
            login();
        }
    });
})