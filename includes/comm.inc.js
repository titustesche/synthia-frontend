// Important for dissecting the message while it's still being streamed
let actionBuffer = "";
let activityRead = 0;
let aiMessage;

// Encode an image that would be provided by an HTML element, not implemented yet
function encodeImageFile(element) {
    let file = element.files[0];
    // reader = new FileReader();
    reader.onloadend = function() {
        console.log('Result', reader.result.split(',')[1]);
    }
    reader.readAsDataURL(file);
}

async function Request()
{
    const textarea = document.getElementById("query");
    let body = {
        url: "http://localhost:11434/api/chat",
        model: "qwen2.5-coder:14b",
        role: "user",
        query: textarea.value,
        images: []
    }
    let options = {
        method: "POST",
        headers:
            {
                "Content-Type": "application/json"
            },
        body: JSON.stringify(body),
    }
    
    fetch('http://localhost:3000/chat/1', options)
        .then(response => response.body)
        .then(rb => {
            const reader = rb.getReader();

            return new ReadableStream({
                start(controller) {
                    function push() {
                        reader.read().then(async ({done, value}) => {
                            // Close connection if done is set to true
                            if (done) {
                                controller.close();
                                return;
                            }
                            // Fetch the individual words
                            await controller.enqueue(value);
                            let json = JSON.parse(new TextDecoder().decode(value));
                            console.log(json);
                            push();
                        });
                    }
                    push();
                }
            });
        })
        .then(stream =>
            new Response(stream, { headers: { "Content-Type": "text/html" } }).text()
        )
        .then(async (result) => {
            
        });
}

// Triggers when the user sends their message
// Also warning, this is one monster of a function and changing it could even affect the backend
// Change with care and consult the Documentary that does not exist yet
async function sendRequest(role, query) {
    query = role === "system" ? query : textarea.value;
    // For debugging purposes
    console.log(role);
    console.log(query);
    aiMessage = "";
    
    // Add the message to the "messageObjects" object
    try
    {
        messageObjects.push({"role": "user", "content": query, "images": [reader.result.split(',')[1]]});
    }
    catch
    {
        messageObjects.push({"role": "user", "content": query});
    }
    
    // Retrieve that messageObjects container element
    if (role !== "system")
    {
        console.log("User requested message");
        messageElements.push(new Message("user"));
        messageElements[messageElements.length - 1].pushText(textarea.value);
        await saveMessage("user", textarea.value, activeConversation.id);
        activeMessage = new Message("assistant");
        messageElements.push(activeMessage);
        activeMessage.outline = true;
        activeMessage.outlineShape = 'transparent, #00d0ff';
    }
    
    // Construct request
    let url = "http://localhost:11434/api/chat";
    const data = {
        "model": "qwen2.5:14b",
        "messages": messageObjects,
    };

    // Clear the user's input field
    textarea.value = "";

    // Specify request options
    const requestOptions = {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    };

    // Request with the provided data
    fetch(url, requestOptions)
        .then(res => res.body)
        .then(rb => {
            const reader = rb.getReader();

            return new ReadableStream({
                start(controller) {
                    function push() {
                        reader.read().then(async ({done, value}) => {
                            // Close connection if done is set to true
                            if (done) {
                                controller.close();
                                return;
                            }
                            // Fetch the individual words
                            await controller.enqueue(value);
                            let json = JSON.parse(new TextDecoder().decode(value));
                            
                            let word = json.message.content;
                            // Todo: Rework this to support more complex syntax
                            //      also implementing an ongoing stream across many messageObjects to expand upon scripts -- oh boi, i don't think this will happen anytime soon
                            //      Maybe another format?
                            //      Also maybe feed python errors back into the AI for automatic correction -- works, but the AI rather just hallucinates outcomes than actually just reading the new message... bummers

                            // activity read is > 0 when a python script is being sent
                            // actionBuffer stores the current script
                            switch (activityRead > 0)
                            {
                                // If a script is being sent
                                case true:
                                    // Update activity read to account for newly found brackets
                                    activityRead += (word.match(/{/g) || []).length;
                                    activityRead -= (word.match(/}/g) || []).length;

                                    // If it's still above 0
                                    if (activityRead > 0) {
                                        // add the current word to the action buffer
                                        actionBuffer += word;
                                    }

                                    // If that ended the script:
                                    else {
                                        // add the last word
                                        actionBuffer += word;
                                        // Notify the user and send the script to the backend server
                                        await sendAction(actionBuffer);
                                        // clear the action buffer
                                        actionBuffer = "";
                                    }
                                    break;
                                
                                // If no script is being sent
                                case false:
                                    // Update activity read to account for newly found brackets
                                    activityRead += (word.match(/{/g) || []).length;
                                    activityRead -= (word.match(/}/g) || []).length;

                                    // If there is still no script being sent
                                    if (!activityRead > 0) {
                                        // Update the active message with the new response and scroll down (scrolling needs fix, don't know why)
                                        activeMessage.pushText(word);
                                        // Add the current word to the AI's response
                                        aiMessage += word;
                                        updateScroll();
                                    }

                                    // If there is now a script being sent
                                    else {
                                        // Update the action buffer
                                        actionBuffer += word;
                                        // Notify the user
                                        activeMessage.createPyout()
                                        activeMessage.setCode(codes.WRITING);
                                    }
                                    break;
                            }
                            push();
                        });
                    }
                    push();
                }
            });
        })
        .then(stream =>
            new Response(stream, { headers: { "Content-Type": "text/html" } }).text()
        )
        .then(async (result) => {
            // Update the messageObjects
            activeMessage.outline = false;
            messageObjects.push({"role": "assistant", "content": aiMessage});
            await saveMessage("assistant", aiMessage, activeConversation.id);
            
            // if the action buffer still contains a script (should never happen)
            if (actionBuffer.length > 0) {
                // send that script and clear the action buffer
                await sendAction(actionBuffer);
                actionBuffer = "";
            }
        });
}

// This function handles communication with the backend
async function sendAction(code) {
    activeMessage.setCode(codes.RUNNING);
    // Clear up the requested code if it contains unwanted letters
    while (code.charAt(code.length -1 ) === "}" || code.charAt(code.length -1 ) === "\n" || code.charAt(code.length -1 ) === " ") {
        code = code.substring(0, code.length - 1);
    }

    while (code.charAt(0) === "{" || code.charAt(0) === "\n" || code.charAt(0) === " ") {
        code = code.substring(1);
    }
    
    console.log(code)
    
    // Send a request to the backend server 
    fetch("http://127.0.0.1:3000/action", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({"query": code}),
    })
        .then(res => res.body)
        .then(rb => {
            const reader = rb.getReader();
            
            return new ReadableStream({
                start(controller) {
                    function push() {
                        reader.read().then(async ({done, value}) => {
                            // End the communication if done is set to true
                            if (done) {
                                controller.close();
                                return;
                            }
                            await controller.enqueue(value);
                            try {
                                // Decode the response stream
                                let json = JSON.parse(new TextDecoder().decode(value));
                                
                                // If the response contains data
                                if (json.data !== undefined) {
                                    // Update the active message and scroll down
                                    activeMessage.pushResult(json.data);
                                    updateScroll();
                                }
                            }
                            catch (err) {
                                console.error(err);
                            }
                            push();
                        });
                    }
                    push();
                }
            });
        })
        .then(stream =>
            new Response(stream, { headers: { "Content-Type": "text/html" } }).text()
        )
        .then((answer) => {
            // Reformat the answer string to convert it to an array of JSON objects
            let answerStringArray = answer.replaceAll(/}{/g, "}|{").split("|");
            let answerArray = [];

            // Convert the answer string
            answerStringArray.forEach((item) => {
                try {
                    answerArray.push(JSON.parse(item.replace("\\n", "")));
                }
                catch (e) {
                    console.error(e);
                }
            });

            // Used to store the result as a JSON object
            let result = { data: [] };

            // Loop through the entire answer object and look for data, errors and exit codes
            answerArray.forEach(obj => {
                // Push the corresponding one if found
                if ('data' in obj) {
                    result.data.push(obj.data);
                }
                
                if ('error' in obj)
                {
                    result.error = obj.error;
                }
                
                if ('code' in obj) {
                    result.code = obj.code;
                    updateScroll();
                    activeMessage.setCode(result.code);
                }
            });

            // If it had no data, delete the data field
            if (result.data.length === 0) {
                delete result.data;
            }
            
            // If it had, assign it
            else {
                result.data = result.data.join('\\n');
            }
            
            // If it had an error, create error field
            if (result.error)
            {
                activeMessage.pushError(result.error);
            }
            
            // Create new message objects and push them to the message Array
            let textResult = JSON.stringify(result);
            messageObjects.push({"role": "assistant", "content": aiMessage});
            messageObjects.push({"role": "system", "content": textResult});
            
            // Save the system message in the database
            saveMessage("system", textResult, activeConversation.id);
            
            // Feed the output of that request back to the AI for validation (can lead to never ending loops)
            sendRequest("system", textResult);
        })
        // Abusing the pyout error handling to display my shitty programming mistakes
        .catch((err) => {
            activeMessage.pushError(err);
            activeMessage.setCode(codes.ERROR);
        });
}

// Get all the conversations from the database and return them as and array
async function generateConversations() {
    let res = [];
    let url = `http://localhost:3000/conversation`;
    let requestOptions = {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    }
    
    await fetch(url, requestOptions)
        .then(res => res.json())
        .then(result => {
            result.conversations.forEach(conversation => {
                res.push(new Conversation(conversation.id, conversation.name));
            });
        });
    return res;
}

// Save a message to the database
async function saveMessage(role, message, conversationId) {
    let url = `http://localhost:3000/message/${conversationId}`;
    let requestOptions = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({"role": role, "content": message}),
    }
    
    await fetch(url, requestOptions)
        .then(res => res.json());
}

// Requests all messages of a conversation from the backend
async function getMessages(id) {
    let res = [];
    let url = `http://localhost:3000/message/${id}`;
    let requestOptions = {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    }
    
    await fetch(url, requestOptions)
        .then(res => res.json())
        .then(result => {
            res.push(systemMessage);
            result.messages.forEach(message => {
                res.push(message);
            });
        });
    return res;
}