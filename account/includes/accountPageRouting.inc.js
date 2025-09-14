window.onload = () => {
    const params = new URLSearchParams(window.location.search);

    // Load different body elements for whatever you wish to display
    switch (params.get('page')) {
        case 'register':
            alert("Register");
            break;
        case 'login':
            alert("Login");
            break;
        case 'resetPassword':
            alert("Reset Password");
            break;
        case 'logout':
            alert("Logout");
            break;
    }
}