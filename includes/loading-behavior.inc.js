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
    INPUT_REQUIRED: "Waiting for Input", // Not in use
})

// Shit that needs to be done when the site is first loaded
window.onload = async function() {
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
        // IMPORTANT do not remove that plus sign for gods sake
        activeConversation = conversations.find(conversation => conversation.id === new URL(window.location.href).searchParams.get("conversation"));
        activeConversation.object.setAttribute("active", "true");

        // Loads all the Messages of the selected Conversion into memory
        await updateMessages(activeConversation);
        updateScroll(true, 'instant');
    }

    catch (e) {
        if (e.message === "Unauthorized") {
            window.location.href = `account/?action=login&cause=Unauthorized&redirect=${window.location.href}`;
        }
        console.log(e.message);
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

    // The styling part
    // Todo:
    //      Apply this effect to messages when the ai is typing to indicate activity
    //      Maybe another color when generating python scripts?

    // Unused as of now.
    // Was intended to change the message opacity when they get out of sight
    // I will probably revisit this so it stays as a comment
    /*
    chatbox.addEventListener('scroll', async function() {
        await messageOpacity(this, document.querySelectorAll('.msg_user'));
    })
    */

    // Way too resource intensive for making text look a fancy, but I like it
    // Also it's fully customizable for every text Element
    document.getElementsByTagName('body')[0].addEventListener('mousemove', function (e) {
        // Read the default text color to use it as "Background"
        let textColor = getComputedStyle(cssRoot).getPropertyValue('--primary-text-color');
        
        // Apply Effect to messages and Conversations
        messageElements.forEach(messageElement => {
            if (messageElement.role === "assistant") {
                drawMouseHighlight(messageElement.body, e.pageX, e.pageY, "rgb(136,255,255)", "white", 150);
                // Optional Mouse highlight for Assistant header, looks better without it
                // drawMouseHighlight(messageElement.header, e.pageX, e.pageY, '#25d80a', "#0a5fd8", 150);
            }

            else {
                drawMouseHighlight(messageElement.body, e.pageX, e.pageY, "rgb(150,202,107)", "white", 150);
                // Optional Mouse highlight for User header, looks better without it
                // drawMouseHighlight(messageElement.header, e.pageX, e.pageY, '#0a5fd8', "#25d80a", 100);
            }
        });
        conversations.forEach(conversation => {
            drawMouseHighlight(conversation.object, e.pageX, e.pageY, "rgba(110,20,205,0.5)", textColor, 60);
        });
        
        // Can be uncommented to apply to other elements as well, but I like it subtle
        // drawMouseHighlight(document.getElementById('glassWrapper'), e.pageX, e.pageY, "rgba(0,255,221,0.63)");
        // drawMouseHighlight(document.getElementById('sidebar-wrapper'), e.pageX, e.pageY, "rgba(0,101,255,0.63)");
    });
}