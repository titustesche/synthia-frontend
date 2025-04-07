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
    messageElements.push(new Message("user"));
    messageElements[messageElements.length - 1].pushText(textarea.value);
    activeMessage = new Message("assistant");
    messageElements.push(activeMessage);
    activeMessage.outline = true;
    activeMessage.outlineShape = 'transparent, #00d0ff';

    let body = {
        url: "http://localhost:11434/api/chat",
        model: "deepseek-r1:32b",
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

    textarea.value = "";

    fetch(`http://localhost:3000/chat/${activeConversation.id}`, options)
        .then(response => response.body)
        .then(rb => {
            const reader = rb.getReader();

            return new ReadableStream({
                start(controller) {
                    updateTurbulence(3.5, 0.01);
                    function push() {
                        reader.read().then(async ({done, value}) => {
                            // Close connection if done is set to true
                            if (done) {
                                controller.close();
                                activeMessage.outline = false;
                                shaderSpeed = 0.3;
                                updateTurbulence(1.5, 0.01);
                                return;
                            }
                            // Fetch the individual words
                            await controller.enqueue(value);
                            let chunk = new TextDecoder().decode(value);

                            try {
                                let json = JSON.parse(chunk);
                                let type = json.type;
                                let content = json.data;
                                shaderSpeed = 2;

                                switch (type) {
                                    case "think":
                                        if (content.length <= 0) {
                                            console.log("Undefined content received");
                                            break;
                                        }

                                        await (async () => {
                                            for (let char of content) {
                                                activeMessage.pushThought(char);
                                                await new Promise(function (resolve) {
                                                    setTimeout(resolve, 20);
                                                });
                                            }
                                        })();
                                        break;

                                    case "text":
                                        if (!content) {
                                            console.log("Undefined content received");
                                            break;
                                        }

                                        await (async () => {
                                            for (let char of content) {
                                                activeMessage.pushText(char);
                                                await new Promise(function (resolve) {
                                                    setTimeout(resolve, 20);
                                                });
                                            }
                                        })();
                                        break;

                                    case "script":
                                        if (!content) {
                                            console.log("Undefined content received");
                                            break;
                                        }

                                        await (async () => {
                                            for (let char of content) {
                                                activeMessage.pushText(char);
                                                await new Promise(function (resolve) {
                                                    setTimeout(resolve, 20);
                                                });
                                            }
                                        })();
                                        break;
                                }
                            }

                            catch (e) {
                                console.log(`An error occurred: ${e}, Chunk: ${chunk}`);
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