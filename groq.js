module.exports = function(RED) {
    const GROQ = require('groq-sdk'); // Ensure the correct package name is used

    // Define the GROQ node
    function GroqNode(config) {
        // Initialize the node with the provided configuration
        RED.nodes.createNode(this, config);
        const node = this;

        // Retrieve the GROQ configuration node
        const configNode = RED.nodes.getNode(config.groqConfig);
        if (!configNode) {
            node.error("GROQ Configuration not found"); // Log an error if the configuration node is missing
            return; // Exit the node if configuration is not found
        }

        // Extract the API Key from the configuration node's credentials
        const groqApiKey = configNode.credentials.apiKey;

        // Retrieve additional parameters from the node's configuration with default values
        const defaultModel = config.model || 'llama3-8b-8192'; // Default model if not specified
        const defaultTemperature = parseFloat(config.temperature) || 1; // Default temperature, parsed as a float
        const defaultMaxToken = parseInt(config.max_token, 10) || 100; // Default max tokens, parsed as an integer
        const defaultSystem = config.system || ''; // Default system role, empty string if not specified
        const defaultUser = config.user || ''; // Default user message, empty string if not specified

        // Initialize the GROQ client with the API Key
        let client;
        try {
            client = new GROQ({
                apiKey: groqApiKey,
                // Add other configurations if necessary
            });
        } catch (initError) {
            node.error(`Error initializing GROQ client: ${initError.message}`); // Log initialization errors
            return; // Exit the node if client initialization fails
        }

        // Handle incoming messages to the node
        node.on('input', async function(msg, send, done) {
            try {
                // Override default values with those from the incoming message, if provided
                const model = msg.model || defaultModel; // Use msg.model if available, else defaultModel
                const temperature = msg.temperature !== undefined ? parseFloat(msg.temperature) : defaultTemperature; // Parse temperature from msg or use default
                const max_token = msg.max_token !== undefined ? parseInt(msg.max_token, 10) : defaultMaxToken; // Parse max_token from msg or use default
                const system = msg.system || defaultSystem; // Use msg.system if available, else defaultSystem
                const user = msg.user || defaultUser; // Use msg.user if available, else defaultUser

                // Log the parameters being sent to GROQ for debugging purposes
                node.log(`Sending GROQ request with the following parameters:
                    Model: ${model}
                    Temperature: ${temperature}
                    Max Token: ${max_token}
                    System Role: ${system}
                    User Message: ${user}`);

                // Build the array of messages to send to the GROQ API
                const messages = [];
                if (system) {
                    messages.push({ role: 'system', content: system }); // Add system role message if provided
                }
                if (user) {
                    messages.push({ role: 'user', content: user }); // Add user message if provided
                } else {
                    // If no specific user message is provided, use the query from the payload
                    messages.push({ role: 'user', content: query }); // NOTE: 'query' is not defined in this scope
                }

                // Send the request to the GROQ API and await the response
                const chatCompletion = await client.chat.completions.create({
                    messages: messages, // Array of messages constructed above
                    model: model, // Model to use
                    temperature: temperature, // Temperature setting
                    max_tokens: max_token, // Maximum number of tokens
                });

                // Extract the response content from the API's response
                const response = chatCompletion.choices[0].message.content;

                // Log the received response for debugging purposes
                node.log(`Response received from GROQ: ${response}`);

                // Assign the response to msg.payload to pass it to the next node in the flow
                msg.payload = response;

                // Send the message onward in the Node-RED flow
                send(msg); // Forward the message to the next connected node
                done(); // Signal that processing is complete
            } catch (error) {
                // In case of an error, log it and signal completion with the error
                node.error(`Error connecting to GROQ: ${error.message}`, msg); // Log the error with the message context
                done(error); // Signal to Node-RED that an error has occurred
            }
        });
    }

    // Register the GROQ node with Node-RED
    RED.nodes.registerType("groq", GroqNode, {
        defaults: {
            name: { value: "" }, // Default value for the node's name
            groqConfig: { type: "groq-config", required: true }, // Reference to the GROQ configuration node, marked as required
            model: { value: "llama3-8b-8192" }, // Default model value
            temperature: { value: 1 }, // Default temperature value
            max_token: { value: 100 }, // Default max_token value
            system: { value: "" }, // Default system role (empty)
            user: { value: "" } // Default user message (empty)
        },
        inputs: 1, // Number of input connections the node accepts
        outputs: 1, // Number of output connections the node provides
        icon: "file.png", // Icon displayed for the node in the palette
        label: function() {
            return this.name || "groq"; // Label displayed on the node, defaults to "groq" if no name is set
        }
    });
}
