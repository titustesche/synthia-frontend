// Class to represent Conversations as objects
class Conversation {
    id;
    name;
    object;
    static conversations = [];
    
    constructor(id, name)
    {
        this.id = id;
        this.name = name;
        Conversation.conversations.push(this);
    }

    destroy() {
        Conversation.conversations.splice(Conversation.conversations.indexOf(this), 1);
        this.object.remove();
    }

    addOnClick() {
        console.log(this);
        this.object.addEventListener("click", async () => {
            const url = new URL(window.location.href);
            const params = new URLSearchParams(url.search);
            params.set("conversation", this.id);
            window.history.pushState({}, "", `?${params}`);
            for (let conversation of Conversation.conversations) {
                if (conversation.object) conversation.object.setAttribute("active", "false");
            }
            this.object.setAttribute("active", "true");
            activeConversation = this;
            await updateMessages(this);
        })
    }

    // Function to render these conversations in any given container
    render(container)
    {
        this.object = container.appendChild(document.createElement("div"));
        this.object.className = "conversation";
        this.object.innerText = this.name;
        this.addOnClick();
    }
}

// Class to represent Messages
// Todo: Add a way to interact with individual elements inside the message
class Message {
    // Thinking portion of the message
    thoughtContainer;
    thoughts = "";
    visibleThoughts = false;
    // Content of the message for in program usage
    content = "";
    // The role as a string
    role;
    // The message's HTML element
    object;
    // The message's header child element
    header;
    // The message's body element
    body;
    // The message's pyout elements
    pyout;
    pyoutResult;
    pyoutCode;
    pyoutHeader;
    contentQueue = [""];
    isRendering = false;
    blocks = {};

    // The message outline's attributes
    // Todo: Implement these somehow?
    //  I don't really know why they are still around to be honest,
    //  but i like this approach so i'm gonna implement it anyway
    get outline() { return this._outline; }
    get outlineShape() { return this._outlineShape; }
    set outline(outline) { this._outline = outline;
        switch (this._outline) {
            case true:
                this.object.setAttribute("outline", "true");
                break;

            case false:
                this.object.setAttribute("outline", "false");
                break;
        }
    }
    set outlineShape(outlineShape) { this._outlineShape = outlineShape; cssRoot.style.setProperty("--outline-shape", this._outlineShape); }
    
    // Default construct for a message
    constructor (role) {
        // Load attributes of that message and form HTML Elements
        this.role = role;
        this.object = chatbox.appendChild(document.createElement("div"));
        this.object.className = `msg_${role}`;
        this.header = this.object.appendChild(document.createElement("div"));
        this.header.setAttribute("class", "message-header");
        // Associate roles with their names and Print in Header
        this.createHeader();

        this._outline = false;
        this._outlineShape = "#ffffffff";
        this.object.setAttribute("outline", this._outline);
        cssRoot.style.setProperty("--outline-shape", this._outlineShape);

        // Force scroll if it's a user message
        if (this.role === "user") { updateScroll(true); }
        else { updateScroll(); }
    }
    
    // Todo:
    //  Rework to match the following requirements:
    //  - Initialize() creates the header and renders the message on screen
    //  - Pack all the pushWhatever methods into one queueContent(type, content)
    //      - This would then manage displaying all the messages contents, also prevents word skipping
    //      - This can then look at a json file or whatever to easily make use of custom message elements

    async functionUpdateContent(content) {
        this.content += content;
        for (let i = 0; i < this.content.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 200));
            this.pushText(this.content[i]);
        }
    }

    // Todo: What needs to happen here
    //      Create variable isRendering
    //      This method just stores the content in an array
    //      When this method is called and it's not rendering, start rendering a COPY of ths array
    //      Once we are through that copy, delete the copy's components from the real array
    //      Check if there is content left to render, if so, repeat the rendering
    //      The rendering function can just be a callback function inside here i think

    queueContent(type, content) {
        switch (type) {
            case "text":
                this.pushText(content);
                break;

            case "think":
                this.pushThought(content);
                break;

            case "script":
                if (!this.pyout) this.createPyout();
                this.pushResult(content);
                break;
        }

        // Todo: This has to undergo some revision to support any type of content
        // Add new content to the queue
        /*
        if (content !== undefined) this.contentQueue.push(content);
        // Return if rendering is already in progress
        if (this.isRendering) { return; }

        // Set isRendering flag, so no double rendering occurs
        this.isRendering = true;

        // If not, start rendering by:
        // Create a copy of the content queue so avoid modification related issues
        let cqCopy = this.contentQueue.slice(0);

        // Loop through each word
        for (let word of cqCopy) {
            // And each character of that word
            for (let char of word) {
                this.pushText(char);
            }
        }

        // Remove the just rendered content from the content queue
        this.contentQueue = this.contentQueue.filter(item => !cqCopy.includes(item));
        // Reset isRendering to accept new content to be rendered
        this.isRendering = false;
        if (this.contentQueue.length > 0) this.queueContent(type, undefined);
         */
    }

    // Also does what it says
    createHeader() {
        if (this.role === "user") {
            this.header.innerText = window.config.chat.userName;
            this.header.style.color = "#25d80a";
        }
        
        else {
            this.header.innerText = window.config.chat.assistantName;
            this.header.style.color = "#0a5fd8";
        }
    }
    
    // ..., pyout is a console like window inside the message that renders python outputs
    createPyout() {
        // Don't know what this is, but I'm gonna leave it here
        //this.object.innerHTML += `<div class="pyout"><p class="pyout_header">Python output:</p><p class="pyout_result"></p><p class="pyout_code"></p></div>`;
        
        // Same as with the messages, build HTML Elements, this time inside the message
        this.pyout = this.object.appendChild(document.createElement("div"));
        this.pyout.className = `pyout`;
        
        this.pyoutHeader = this.pyout.appendChild(document.createElement("div"));
        this.pyoutHeader.className = `pyout_header`;
        this.pyoutHeader.textContent = `Python output:`;
        
        this.pyoutResult = this.pyout.appendChild(document.createElement("div"));
        this.pyoutResult.className = `pyout_result`;
        this.pyoutResult.setAttribute("textCursor", "true");
        
        this.pyoutCode = this.pyout.appendChild(document.createElement("div"));
        this.pyoutCode.className = `pyout_code`;
        
        updateScroll();
    }
    
    // Pushes a programs result to the active pyout
    pushResult(result) {
        this.pyoutResult.textContent += result;
        this.pyoutResult.scrollTop = this.pyoutResult.scrollHeight;
        updateScroll();
    }
    
    // Pushes and error to the active pyout
    pushError(error) {
        this.pyoutResult.textContent += `<span style="color: #ff6f6f">${error}</span>`;
        this.pyout.scrollTop = this.pyout.scrollHeight;
        updateScroll();
    }
    
    // Sets an operation Code for the active pyout
    setCode(code) {
        this.pyoutCode.innerHTML = `Status: ${code}`;
        switch (code) {
            // 1 and 0 are for program exits
            case codes.ERROR:
                this.pyoutCode.style.backgroundColor = '#af0000';
                this.outlineShape = '#ff0000';
                this.pyoutResult.setAttribute("textCursor", "false");
                break;
            
            case codes.SUCCESS:
                this.pyoutCode.style.backgroundColor = '#005900';
                this.outlineShape = '#00ff00';
                this.pyoutResult.setAttribute("textCursor", "false");
                break;
                
            // These are for when the request is still being executed
            case codes.RUNNING:
                this.pyoutCode.style.backgroundColor = '#a15b00';
                this.outlineShape = '#d89716';
                break;
                
            case codes.WRITING:
                this.pyoutCode.style.backgroundColor = '#001ba3';
                this.outlineShape = '#0033ff';
                break;
        }
    }

    updateThoughtContainer() {
        // Can be called like that because this method is only ever called after the thoughtContainer was initiated
        if (!this.visibleThoughts) {
            this.thoughtContainer.textContent = "Thinking...";
            return;
        }

        this.thoughtContainer.textContent = this.thoughts;
    }

    pushThought(thought) {
        if (!this.thoughtContainer) {
            this.thoughtContainer = this.object.appendChild(document.createElement("div"));
            this.thoughtContainer.className = `thought_container`;
            this.thoughtContainer.addEventListener("click", () => {
                this.visibleThoughts = !this.visibleThoughts;
                this.updateThoughtContainer();
                updateScroll();
            });
            this.updateThoughtContainer();
            // Todo: This currently just counteracts the \n beginning, find solution in backend
            updateScroll();
            this.thoughts += thought;
            return;
        }
        updateScroll();
        this.thoughts += thought;
        this.updateThoughtContainer();
    }

    // Add new text to the active message
    pushText(text) {
        // text = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        if (!this.body)
        {
            this.body = this.object.appendChild(document.createElement("div"));
            this.body.className = `message-body`;
            this.body.textContent += text;
            updateScroll();
            return;
        }
        this.body.textContent += text;
        this.content += text;
        updateScroll();
    }
}

// Updates all the messages of a given conversation
async function updateMessages(conversation) {
    // Get all the messages
    // Clear Elements and current Chatbox
    messageElements = [];
    chatbox.innerHTML = "";
    // Wait for messages to render
    await renderMessages(await getMessages(conversation.id))
        .then(() => {
            updateScroll(true, "instant");
            return true;
        });
}

// Render
async function renderMessages(messages) {
    for(let i = 0; i < messages.length; i++) {
        if (i !== 0) {
            activeMessage = new Message(messages[i].role);
            if (messages[i].role !== "system") {
                if (messages[i].role !== "user")
                {
                    let cleanMessage = {blocks: [undefined]};
                    cleanMessage = JSON.parse(`{"blocks":${messages[i].content}}`);

                    for (let block of cleanMessage.blocks) {
                        switch(block.type) {
                            case "think":
                                activeMessage.pushThought(block.content);
                                break;

                            case "text":
                                activeMessage.pushText(block.content);
                                break;

                            case "script":
                                activeMessage.createPyout();
                                activeMessage.pushResult(block.content);
                                break;
                        }
                    }
                    continue;
                }
                activeMessage.pushText(messages[i].content);
            }
            else {
                let output = JSON.parse(messages[i].content);

                activeMessage.createPyout();
                if (output.data !== undefined) {
                    activeMessage.pushResult((output.data).replaceAll('\\n', '\n'));
                }
                if (output.error !== undefined) {
                    activeMessage.pushError(output.error);
                }
                if (output.code !== undefined) {
                    activeMessage.setCode(output.code);
                }
            }
            // Push to global message Elements
            activeMessage.outlineShape = '#ffffff00';
            messageElements.push(activeMessage);
        }
    }
}

// Supposed to take a container and an array of messages
// to change their opacity depending on their position in the container
async function messageOpacity(container, messages) {
    let containerHeight = container.clientHeight;
    let containerTop = container.scrollTop;

    messages.forEach(message => {
        let messageTop = message.offsetTop - containerTop;
        let messageHeight = message.clientHeight;

        let opacity = 1;

        if (messageTop + messageHeight < 0 || messageTop > containerHeight) {
            opacity = 0;
        }

        else if (messageTop < 50)
        {
            opacity = messageTop / 50;
        }

        else if (messageTop + messageHeight > containerHeight - 50)
        {
            opacity = (containerHeight - (messageTop + messageHeight) / 50);
        }

        this.style.opacity = `${opacity}`;
    })
}

// Updates scrolling, accepts the default behaviors
function updateScroll(force = false, behavior = 'smooth') {
    if (!force) {
        if (chatbox.scrollHeight <= (chatbox.scrollTop + chatbox.offsetHeight*1.2)) {
            chatbox.scrollTo({
                top: chatbox.scrollHeight,
                behavior: behavior
            });
        }
    }
    else
    {
        chatbox.scrollTo({
            top: chatbox.scrollHeight,
            behavior: behavior
        });
    }
}

// Draws the mouse highlight on selected text
function drawMouseHighlight(element, x, y, color, backgroundColor, size) {
    if (element) {
        // Get ALL the dimensions and points
        let rect = element.getBoundingClientRect();
        let width = element.offsetWidth;
        let height = element.offsetHeight;
        let posX = rect.left;
        let posY = rect.top;

        // Do some fancy looking math on them
        let highlightX = (x - posX) / width * 100;
        let highlightY = (y - posY) / height * 100;

        // Boom, circle!
        element.style.backgroundClip = 'text';
        element.style.color = 'transparent';
        element.style.backgroundImage = `radial-gradient(circle farthest-corner at ${highlightX}% ${highlightY}%, ${color} 5px, ${backgroundColor} ${size}px`;
    }
}

async function newConversation() {
    let name = prompt("Name");
    console.log(name);

    let conversation = new Conversation();
    await fetch (`${window.config.api.backendUrl}/conversation`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name: name
        }),
        credentials: "include",
    })
        .then(response => response.json())
        .then(data => {
            console.log(data.conversation)
            conversation.id = data.conversation.id;
            conversation.name = data.conversation.name;
        });
    conversation.render(conversationContainer);
}

async function updateOpacity() {
    let container = document.getElementById("conversation-wrapper");
    let containerTransform = container.getBoundingClientRect();
    let conversations = container.children;
    let scaleFactor = 5.5;

    for (let i = 0; i < conversations.length; i++) {
        let conversationTransform = conversations[i].getBoundingClientRect();
        // Get the y position of the bottom of the container
        let containerBottom = (containerTransform.height + containerTransform.y - conversationTransform.height).toFixed(0);
        // Get the distance between the y coordinate of the conversation and the bottom of the container
        let distance = -(containerBottom - conversationTransform.y.toFixed(0));
        // Calculate influence from that
        let influence = 100 - ((distance / conversationTransform.height).toFixed(2) * 100);
        influence = influence > 100 ? 100 : influence;
        // Apply that opacity to the object
        conversations[i].style.opacity = influence + '%';
        // Geez, it's not even noticeable :(
    }
}

// Make Elements in the conversation view fade when they reach the bottom of their parent
