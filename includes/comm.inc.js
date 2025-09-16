// Important for dissecting the message while it's still being streamed
let actionBuffer = "";
let activityRead = 0;
let aiMessage;
let messageObjects = []; // Todo: This does not need to be global -_-

// Encode an image that would be provided by an HTML element, not implemented yet
function encodeImageFile(element) {
    let file = element.files[0];
    // reader = new FileReader();
    reader.onloadend = function() {
        console.log('Result', reader.result.split(',')[1]);
    }
    reader.readAsDataURL(file);
}


// Todo: Sometimes objects cant be parsed because they are two objects as one (e.g. {name: "one"}{name: "two"})
async function Request(prompt)
{
    // Fallback for when the prompt can't be directly delivered like when pressing the "send" button manually
    if (!prompt) {
        let textarea = document.getElementById("query");
        prompt = textarea.value;
        textarea.value = null;
    }

    // Add the message to the "messageObjects" object
    try
    {
        messageObjects.push({"role": "user", "content": prompt, "images": [reader.result.split(',')[1]]});
    }
    catch
    {
        messageObjects.push({"role": "user", "content": prompt});
    }

    // Retrieve that messageObjects container element
    messageElements.push(new Message("user"));
    messageElements[messageElements.length - 1].pushText(prompt);
    activeMessage = new Message("assistant");
    messageElements.push(activeMessage);
    // activeMessage.outline = true;
    activeMessage.outlineShape = 'transparent, #00d0ff';

    let body = {
        url: `${window.config.api.ollamaUrl}/api/chat`,
        model: "gpt-oss",
        role: "user",
        query: prompt,
        images: []
    }
    let options = {
        method: "POST",
        headers:
            {
                "Content-Type": "application/json"
            },
        body: JSON.stringify(body),
        credentials: "include"
    }

    fetch(`${window.config.api.backendUrl}/chat/${activeConversation.id}`, options)
        .then(response => response.body)
        .then(rb => {
            const reader = rb.getReader();

            return new ReadableStream({
                start(controller) {
                    // Make shader turbulent when text is being generated
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

                            // Yes, error handling
                            try {
                                let json = JSON.parse(chunk);
                                let type = json.type;
                                let content = json.data;
                                if (type === "script") {
                                    let lang = json.lang;
                                }
                                shaderSpeed = 2;

                                // Todo: Rework this into a single function and let message class worry about that
                                //      oh, also tell message class how to worry about it

                                activeMessage.queueContent(type, content);
                            }

                            // kinda...
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

// Get all the conversations from the database and return them as and array
async function generateConversations() {
    let res = [];
    let url = `${window.config.api.backendUrl}/conversation`;
    let requestOptions = {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
    }

    try {
        let response = await fetch(url, requestOptions);
        if (response.status === 401) {
            throw new Error("Unauthorized");
        }

        if (!response.ok) {
            throw new Error("HTTP Error. Status: " + response.status);
        }

        const result = await response.json();
        result.conversations.forEach(conversation => {
            res.push(new Conversation(conversation.id, conversation.name));
        });
        return res;
    }

    catch (e) {
        throw e;
    }
}

// Requests all messages of a conversation from the backend
async function getMessages(id) {
    let res = [];
    let url = `${window.config.api.backendUrl}/message/${id}`;
    let requestOptions = {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
    }

    await fetch(url, requestOptions)
        .then(res => res.json())
        .then(result => {
            res.push(systemMessage);
            result.messages.forEach(message => {
                res.push(message);
            });
        });

    // Res is an array of messages and is
    return res;
}