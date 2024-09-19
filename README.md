## A Node-RED Node to Connect to the GROQ API

**Node-RED Contrib GROQ** is a powerful Node-RED plugin that enables seamless integration with the GROQ API. Whether you're building chatbots, data processing workflows, or automated responses, this node provides the flexibility and functionality needed to harness GROQ's capabilities within your Node-RED environment.

---

## Features

- **Seamless Integration**: Easily connect Node-RED flows to the GROQ API.
- **Flexible Configuration**: Customize model, temperature, max tokens, system roles, and user messages.
- **Secure Credentials**: Safely store and manage your GROQ API Key using Node-RED's built-in credential management.
- **Dynamic Parameters**: Override default configurations dynamically through incoming messages.
- **Comprehensive Logging**: Detailed logs for debugging and monitoring API interactions.

---

## Installation

Not ready yet ;-)

## Configuration

### Groq Configuration
1. Drag the Groq node into your workspace
2. Configure the node by adding a new Groq Configuration
3. Enter a name and your Groq API Key
4. Save it

### Node configuration
- GROQ Configuration: Select the GROQ configuration you created earlier.
  
- Model: Choose the desired model (e.g., llama3-8b-8192).
- Temperature: Set the temperature (0.01 to 2) to control the randomness of the output.
- Max Token: Set the maximum number of tokens (1 to 8192) for the response.
- System Role: Define the system role (optional).
- User Message: Define the user message (optional).

## Advanced Configuration
### Dynamic Parameter Override:

You can dynamically override parameters like model, temperature, max_token, system, and user by including them in the incoming message payload. This allows for greater flexibility and reuse of the GROQ node across different scenarios.
Usin msg.model, msg.temperature, msg.max_token, msg.system, msg.user

#### System and User Roles:

Define specific roles to guide the behavior of the GROQ API, enabling more controlled and context-aware responses.

## Parameters

| Parameter    | Description                                                        | Type   | Default          |
|--------------|--------------------------------------------------------------------|--------|------------------|
| `name`       | (Optional) Name of the node for identification within the flow.    | String | `""`             |
| `groqConfig` | Reference to the GROQ configuration node containing the API Key.    | Config | **Required**     |
| `model`      | The model to use for the GROQ API (e.g., `llama3-8b-8192`).        | String | `llama3-8b-8192` |
| `temperature`| Controls the randomness of the output. Range: 0.01 to 2.           | Number | `1`              |
| `max_token`  | Maximum number of tokens in the response. Range: 1 to 8192.        | Number | `1024`            |
| `system`     | (Optional) Defines the system role for the conversation.           | String | `""`             |
| `user`       | (Optional) Defines the user message to be sent to the API.          | String | `""`             |

