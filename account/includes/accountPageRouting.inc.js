async function loadDynamicContent() {
    const params = new URLSearchParams(window.location.search);
    const wrapper = document.getElementById('content-wrapper');
    let content;

    // Load different body elements based on the parameters in the URL
    await fetch(`includes/${params.get('page')}.html`)
        .then(response => {
            // If the response returned 200, pass the received HTML
            if (response.ok) return response.text();
            // If not, pass and error message
            return `<h1>The requested content could not be loaded! <br />Are the parameters correct?</h1>`;
        })
        .then(res => {
            // Assign error message to the res (yes this needs to be in its own .then because otherwise it will be a pending promise)
            content = res;
        })
    // Display the loaded content
    wrapper.innerHTML = content;
}

window.onload = async () => {
    await loadDynamicContent();
}