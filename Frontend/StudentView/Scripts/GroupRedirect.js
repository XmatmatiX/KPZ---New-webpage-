
const token = sessionStorage.getItem("JWT");
function redirectToGroup()
{
    console.log("test1");
    fetch(`https://projekty.kpz.pwr.edu.pl/api/Student/MemberType`, {
    method: "GET",
    headers: {
        "Authorization": `Bearer ${token}`
    }
    })
    .then(response => {
        console.log("test2");
    if (!response.ok) {
        console.log(response);
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
    })
    .   then(data => {
    switch(data.memberType) {
        case "withoutGroup":
            window.location.href = "StudentWithoutGroup.html";  // Ścieżka do strony bez grupy
            break;
        case "student":
            window.location.href = "YourGroup.html";  // Ścieżka do strony studenta
            break;
        case "leader":
            window.location.href = "YourGroupLeader.html";  // Ścieżka do strony lidera
            break;
        default:
            console.error("Unexpected member type:", data.memberType);
    }
})
.catch(error => {
  console.error("Error:", error);
});
}