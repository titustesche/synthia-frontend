// Global Variables
let reader = new FileReader();
// HTML Elements that need to be global
let chatbox, conversationContainer, cssRoot, activeMessage, activeConversation, conversations;

// Conversation configuration -> Todo: Let Users edit this
let assistantName = "Synthia";
let userName = "User";
let systemMessage = {
    "role": "system",
    "content":
        "You have the ability to send Python code to a backend server to execute specific tasks." +
        "For simple queries or basic information, you can provide direct answers without using python." +
        "If there's a need for executing a complex task, write python program surrounded by <script></script> and separate individual lines with \n." +
        "When Python is formatted like this, it will be executed by the backend." +
        "The sys, os, webbrowser, random, time and PySide6 modules are allowed to import." +
        "You are not allowed to use any further import statements in your scripts unless they are part of these libraries!" +
        "The system that executes these commands is Fedora Linux 41, you are not allowed to use sudo." +
        "For commands that need to be executed by the system, use the os library. You can access systemctl, loginctl and playerctl." +
        "Never use a script to solve a request that can be completed with natural language" +
        "Everything regarding file access has to happen inside /home/titus or one of its subfolders like" +
        "Bilder, Desktop and Downloads. The Desktop Environment at use is KDE Plasma Version 6." +
        "Do not overcomplicate any task, just use the most simple, straight forward solution there is," +
        "Every time your python program is executed, the system will provide you with the output of that script in json format." +
        "Everything that got printed to the console is available to you." +
        "Never execute a program again if it's code was 1, unless you are told otherwise" +
        "After receiving this output, determine if the execution was successful and inform the user" +
        "When executing a program, the code should always be at the end of your message" +
        "Do not assume outputs, wait for them to be sent"
};

// Important global variables for Runtime - Representations, not real HTML Elements
let messageElements = [];

// Todo: wieder implementieren
const codes = Object.freeze({
    SUCCESS: 0, // Program exit code
    ERROR: 1, // Program exit code
    WRITING: "Writing", // Instructions for displaying
    RUNNING: "Running", // Instructions for displaying
    INPUT_REQUIRED: "Waiting for user Input", // Not in use
})

// Shit that needs to be done when the site is first loaded
async function initSite() {
    // Assign important Elements
    chatbox = document.getElementById('chatbox');
    conversationContainer = document.getElementsByClassName('sidebar-container')[0];
    cssRoot = document.documentElement;

    document.getElementById("conversation-wrapper").addEventListener("scroll", () => {
        updateOpacity();
    });

    // Custom Method, returns all conversations as an array
    try {
        conversations = await generateConversations();

        // Render the Conversations
        await conversations.forEach(conversation => {
            conversation.render(conversationContainer);
        });

        // Set the active Conversation, default is first in array
        activeConversation = conversations.find(conversation => conversation.id === new URL(window.location.href).searchParams.get("conversation"));
        activeConversation.object.setAttribute("active", "true");

        // Loads all the Messages of the selected Conversion into memory
        await updateMessages(activeConversation);
        updateScroll(true, 'instant');
    }

    catch (e) {
        console.log(e);
        if (e.message === "Unauthorized") {
            // Redirect to the login page and keep a reference to the page the user came from
            window.location.href = `account/?page=login&cause=Unauthorized&redirect=${window.location.href}`;
        }
        return;
    }

    // Set the behavior of the query box
    let textarea = document.getElementById('query');
    textarea.addEventListener('keydown', function(e) {
        // Detect if Enter is pressed and Shift isn't
        if (e.code === 'Enter' && !e.shiftKey)
        {
            // Suppress default behavior
            e.preventDefault();
            // Custom Function, sends a request to the specified backend Server
            Request(this.value);
            this.value = null;
            // Reset size, works half of the time - minus 30 because of the padding
            this.style.height = `${Math.min(this.scrollHeight, 100)}px`;
            // Why the fuck do we return false here?
            // return false;
        }
    });

    // Makes it scroll automatically
    textarea.addEventListener('input', function(e) {

        this.style.height = `${Math.min(this.scrollHeight, 100)}px`;
        console.log(this.scrollHeight);
    });

    //region Styling

    // Unused as of now.
    // Was intended to change the message opacity when they get out of sight
    // I will probably revisit this so it stays as a comment
    /*
    chatbox.addEventListener('scroll', async function() {
        await messageOpacity(this, document.querySelectorAll('.msg_user'));
    })

    //endregion
    */
}