// Todo: This HAS to run before anything else
//       Right now this is not always the case

window.addEventListener('load', async () => {
    console.log("Load settings...");
    // Load config from settings.json
    await fetch('/includes/config/config.json')
        .then(response => response.json())
        .then(result => {
            window.config = result;
        });

    console.log("config loaded");

    // Load other stuff only after the config is set
    if (initSite) {
        console.log("init site is defined");
        initSite();
    }


    /* Todo: Make this resolve a global promise
    window.configLoaded = new Promise(resolve => async () => {
        window.config = await fetch('includes/config/config.json')
            .then(res => res.json())
            .then(result => {
                console.log(result);
                window.config = result;
            })
            .then(() => {
                resolve(window.configLoaded)
            });
    });
     */
});