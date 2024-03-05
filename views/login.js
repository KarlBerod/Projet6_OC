function API_login(event){
    event.preventDefault();
    const email=document.getElementById('email').value;
    const password=document.getElementById('password').value;
    const data = { email, password };

    fetch("http://localhost:5678/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Succès:', data);
        if (data.userId==1) {
            localStorage.setItem('token', data.token);
            window.location.href = '../index.html';
        } 
        else {
            alert("combinaison login/mot de passe incorrecte");
            localStorage.setItem('token', '');
        }
    })
    .catch((error) => {
        console.error('Erreur:', error);
    });
}

document.getElementById('login_form').addEventListener('submit', API_login); 