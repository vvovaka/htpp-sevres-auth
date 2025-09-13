async function register() {
    const nameField = document.getElementById("name");
    const passField = document.getElementById("password");
    const messageField = document.getElementById("message");

    fetch("/api/register", {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
        },
        body: JSON.stringify({
            name: nameField.value,
            password: passField.value,
        }),
    }).then((response) => {
        return response.text()
    }).then((msg) => {
        messageField.textContent = msg;
        messageField.style.animation = "show 0.2s";
    });
}