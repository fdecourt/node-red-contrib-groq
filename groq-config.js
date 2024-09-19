module.exports = function(RED) {
    // Define the configuration node for GROQ
    function GroqConfigNode(config) {
        // Initialize the node with the configuration provided
        RED.nodes.createNode(this, config);
        
        const node = this;
        
        // Assign the name from the configuration to the node
        node.name = config.name;
        
        // Initialize credentials object if not already set
        node.credentials = this.credentials || {}; // Placeholder for credentials (API Key)
        
        // The API key can be accessed via this.credentials.apiKey
        
        // Event handler for when the node is closed (e.g., deleted or redeployed)
        node.on('close', (removed, done) => {
            // Perform any necessary cleanup actions here
            
            if (removed) {
                // This block executes if the node is being deleted
                // Add any specific cleanup logic for node deletion if needed
            }
            
            // Signal that the cleanup process is complete
            done(); // Signal that cleanup is done
        });
    }
    
    // Register the configuration node with Node-RED
    RED.nodes.registerType("groq-config", GroqConfigNode, {
        // Define the credentials that this node will use
        credentials: {
            apiKey: { type: "password" } // Define 'apiKey' as a password type for secure storage
        }
    });
}
