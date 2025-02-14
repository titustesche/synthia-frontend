// Class to represent Conversations as objects
class Conversation {
    id;
    name;
    object;
    
    constructor(id, name)
    {
        this.id = id;
        this.name = name;
    }
    
    // Function to render these conversations in any given container
    render(container)
    {
        this.object = container.appendChild(document.createElement("div"));
        this.object.className = "conversation";
        this.object.innerText = this.name;
    }
}

// Class to represent Messages - Todo: Add a way to interact with individual elements inside the message
class Message {
    // Thinking portion of the message
    thoughtContainer;
    thoughts;
    visibleThoughts = false;
    // Content of the message for in program usage
    content;
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

    // The message outline's attributes
    // Todo: Implement these somehow?
    //  I don't really know why they are still around to be honest,
    //  but i like this approach so i'm gonna implement it
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
    
    // Does what it says - deprecated
    /*
    toggleOutline() {
        switch (this._outline) {
            case true:
                this.object.setAttribute("outline", "true");
                break;
                
            case false:
                this.object.setAttribute("outline", "false");
                break;
        }
    }
     */
    
    // Also does what it says
    createHeader() {
        if (this.role === "user") {
            this.header.innerText = userName;
            this.header.style.color = "#25d80a";
        }
        
        else {
            this.header.innerText = assistantName;
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
        this.pyoutResult.innerHTML += result;
        this.pyoutResult.scrollTop = this.pyoutResult.scrollHeight;
    }
    
    // Pushes and error to the active pyout
    pushError(error) {
        this.pyoutResult.innerHTML += `<span style="color: #ff6f6f">${error}</span>`;
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
            this.thoughtContainer.innerHTML = "Thinking...";
            return;
        }

        this.thoughtContainer.innerHTML = this.thoughts;
    }

    pushThought(text) {
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
            this.thoughts += text;
            return;
        }
        updateScroll();
        this.thoughts += text;
        this.updateThoughtContainer();
    }

    // Add new text to the active message
    pushText(text) {
        if (!this.body)
        {
            this.body = this.object.appendChild(document.createElement("div"));
            this.body.className = `message-body`;
            this.body.innerText += text;
            // Todo: This currently just counteracts the \n beginning, find solution in backend
            // this.content += text;
            updateScroll();
            return;
        }
        this.body.innerHTML += text;
        this.content += text;
        updateScroll();
    }
}

// Updates all the messages of a given conversation
async function updateMessages(conversation) {
    // Get all the messages
    messageObjects = await getMessages(conversation.id);
    console.log(messageObjects);
    // Clear Elements and current Chatbox
    messageElements = [];
    chatbox.innerHTML = "";
    // Wait for messages to render
    await renderMessages(messageObjects)
        .then(() => {
            return true;
        });
}

// Render
async function renderMessages(messages) {
    for(let i = 0; i < messages.length; i++) {
        if (i !== 0) {
            if (messages[i].role !== "system") {
                activeMessage = new Message(messages[i].role);
                if (messages[i].role !== "user")
                {
                    let cleanMessage = JSON.parse(`{"blocks":${messages[i].content}}`);

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
            updateScroll();
            
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