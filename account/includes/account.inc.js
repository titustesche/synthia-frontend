function load(page) {
    const url = new URL(window.location);
    const params = new URLSearchParams(url.search);
    if (params.get("page")) {
        console.log("setting page")
        params.set("page", page);
    } else params.append("page", page);

    url.search = params.toString();
    history.pushState(null, "", url.toString());
    loadDynamicContent();
}

async function register() {
    // Get register form
    const registerForm = document.getElementById("register-form");

    // Set API URL and options
    let url = `${window.config.api.backendUrl}/register`;
    let options = {
        method: "POST",
        headers: {
            ContentType: "application/json",
        },
        body: JSON.stringify({
            username: registerForm.elements['username'].value,
            email: registerForm.elements['email'].value,
            password: registerForm.elements['password'].value,
        }),
        credentials: "include",
    }

    try {
        const response = await fetch(url, options);
        if (response.ok) {
            throw new Error(response.statusText);
        }

        const localUrl = new URL(this.location.href);
        const urlParams = new URLSearchParams(localUrl.search);
        window.location.href = urlParams.get("redirect");
    }

    catch (error) {
        console.error(error);
    }
}

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

        // Bring user back to main page
        const localUrl = new URL(this.location.href);
        const urlParams = new URLSearchParams(localUrl.search);
        window.location.href = urlParams.get('redirect');
    }

    catch (e) {
        console.log(e);
    }
}