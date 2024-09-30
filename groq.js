module.exports = function(RED) {
    const GROQ = require('groq-sdk');

    const DEFAULT_MODEL = 'llama3-8b-8192';
    const DEFAULT_TEMPERATURE = 1;
    const DEFAULT_MAX_TOKEN = 100;
    const DEFAULT_SYSTEM = '';
    const DEFAULT_USER = '';

    class GroqNode {
        constructor(config) {
            RED.nodes.createNode(this, config);
            this.config = config;
            this.groqApiKey = null;
            this.client = null;
            this.initialized = false;

            // Initialize the node
            this.initialize();

            // Register input event
            this.on('input', this.onInput.bind(this));
        }

        initialize() {
            // Retrieve the GROQ configuration node
            const configNode = RED.nodes.getNode(this.config.groqConfig);
            if (!configNode) {
                this.error("GROQ Configuration not found");
                return;
            }

            // Extract the API Key from the configuration node's credentials
            this.groqApiKey = configNode.credentials.apiKey;

            // Initialize the GROQ client with the API Key
            try {
                this.client = new GROQ({
                    apiKey: this.groqApiKey,
                    // Add other configurations if necessary
                });
                this.initialized = true;
            } catch (error) {
                this.error(`Error initializing GROQ client: ${error.message}`);
            }
        }

        async onInput(msg, send, done) {
            if (!this.initialized) {
                this.error('GROQ client not initialized');
                done(new Error('GROQ client not initialized'));
                return;
            }

            try {
                const params = this.getParams(msg);
                const messages = this.buildMessages(params, msg);

                this.status({ fill: 'blue', shape: 'dot', text: 'Requesting' });

                this.debug(`Sending GROQ request with the following parameters:
                    Model: ${params.model}
                    Temperature: ${params.temperature}
                    Max Token: ${params.max_token}
                    System Role: ${params.system}
                    User Message: ${messages.map(m => m.content).join('\n')}`);

                const chatCompletion = await this.client.chat.completions.create({
                    messages: messages,
                    model: params.model,
                    temperature: params.temperature,
                    max_tokens: params.max_token,
                });

                const response = chatCompletion.choices[0].message.content;

                this.debug(`Response received from GROQ: ${response}`);

                msg.payload = response;

                send(msg);
                done();

                this.status({});
            } catch (error) {
                this.status({ fill: 'red', shape: 'ring', text: 'Error' });

                this.error(`Error connecting to GROQ: ${error.message}`, msg);
                done(error);
            }
        }

        getParams(msg) {
            const model = msg.model || this.config.model || DEFAULT_MODEL;
            const temperature = msg.temperature !== undefined ? parseFloat(msg.temperature) : parseFloat(this.config.temperature) || DEFAULT_TEMPERATURE;
            const max_token = msg.max_token !== undefined ? parseInt(msg.max_token, 10) : parseInt(this.config.max_token, 10) || DEFAULT_MAX_TOKEN;
            const system = msg.system || this.config.system || DEFAULT_SYSTEM;
            const user = msg.user || this.config.user || DEFAULT_USER;

            if (isNaN(temperature) || temperature < 0.01 || temperature > 2) {
                throw new Error('Temperature must be a number between 0.01 and 2');
            }

            if (isNaN(max_token) || max_token < 1) {
                throw new Error('Max Token must be a positive integer');
            }

            return { model, temperature, max_token, system, user };
        }

        buildMessages(params, msg) {
            const messages = [];
            if (params.system) {
                messages.push({ role: 'system', content: params.system });
            }
            if (params.user) {
                messages.push({ role: 'user', content: params.user });
            } else if (msg.payload) {
                messages.push({ role: 'user', content: msg.payload });
            } else {
                throw new Error('No user message provided');
            }
            return messages;
        }
    }

    RED.nodes.registerType("groq", GroqNode, {
        defaults: {
            name: { value: "" },
            groqConfig: { type: "groq-config", required: true },
            model: { value: DEFAULT_MODEL },
            temperature: { value: DEFAULT_TEMPERATURE },
            max_token: { value: DEFAULT_MAX_TOKEN },
            system: { value: DEFAULT_SYSTEM },
            user: { value: DEFAULT_USER }
        },
        inputs: 1,
        outputs: 1,
        icon: "file.png",
        label: function() {
            return this.name || "groq";
        }
    });

    RED.httpAdmin.get('/groq/models', RED.auth.needsPermission('groq.read'), async function(req, res) {
        try {
            const groqConfigId = req.query.groqConfig;
            if (!groqConfigId) {
                res.status(400).send("groqConfig parameter is missing");
                return;
            }
    
            // Retrieve the GROQ configuration node
            const configNode = RED.nodes.getNode(groqConfigId);
            if (!configNode) {
                res.status(400).send("Invalid groqConfig parameter");
                return;
            }
    
            // Extract the API Key from the configuration node's credentials
            const groqApiKey = configNode.credentials.apiKey;
    
            // Initialize the GROQ client with the API Key
            const client = new GROQ({
                apiKey: groqApiKey,
                // Add other configurations if necessary
            });
    
            // Fetch the models from the GROQ API
            const modelsResponse = await client.models.list();
    
            // Extract the necessary data (id and owned_by) from modelsResponse.data
            const models = modelsResponse.data.map(model => ({
                id: model.id,
                owned_by: model.owned_by
            }));
    
            res.json(models);
        } catch (error) {
            console.error(`Error fetching models: ${error.message}`, error);
            res.status(500).send(`Error fetching models: ${error.message}`);
        }
    });
};
