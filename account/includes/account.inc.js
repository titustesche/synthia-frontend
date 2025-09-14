async function login() {
    // Get login form
    const loginForm = document.getElementById('login-form');

    // Set API url and options
    let url = 'http://localhost:3000/login';
    let options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        // Give email and password to request
        body: JSON.stringify({
            email: loginForm.elements['email'].value,
            password: loginForm.elements['password'].value,
        }),
        credentials: 'include',
    };

    try {
        // Wait for a response
        const response = await fetch(url, options);
        // If the response wasn't ok, throw a new error
        if (!response.ok) {
            throw new Error(response.statusText);
        }

        // Otherwise, store the token as a cookie
        const result = await response.json();
        // sessionStorage.setItem('token', result.token);

        // Bring user back to main page
        const localUrl = new URL(this.location.href);
        const urlParams = new URLSearchParams(localUrl.search);
        window.location.href = urlParams.get('redirect');
    }

    catch (e) {
        console.log(e);
    }
}