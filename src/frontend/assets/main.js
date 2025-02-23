// Configuration
const CANISTER_ID = "6ldcj-gyaaa-aaaab-qacsa-cai"; // Replace with actual ID
const IC_HOST = "https://icp0.io";

// Debug mode
const IS_LOCAL_DEVELOPMENT = window.location.host.includes('localhost');

async function initAgent() {
  try {
    console.log("Initializing agent...");
    
    // Check library loading
    if (!window.ic || !window.ic.HttpAgent) {
      throw new Error("DFinity libraries not loaded! Check script tags.");
    }

    const agent = new window.ic.HttpAgent({ 
      host: IC_HOST 
    });

    // Fetch root key for local development
    if (IS_LOCAL_DEVELOPMENT) {
      console.warn("Development mode - fetching root key");
      await agent.fetchRootKey();
    }

    // Create actor with interface
    const actor = window.ic.createActor({
      canisterId: CANISTER_ID,
      interfaceFactory: ({ IDL }) => {
        return IDL.Service({
          write_message: IDL.Func([IDL.Text], [], []),
          read_messages: IDL.Func([], [IDL.Vec(IDL.Text)], ['query'])
        });
      },
      agent
    });

    console.log("Agent initialized successfully");
    return actor;
  } catch (error) {
    console.error("Agent initialization failed:", error);
    throw error; // Rethrow for handling in caller
  }
}

async function sendMessage() {
  try {
    const input = document.getElementById("messageInput");
    console.log("Sending message:", input.value);
    
    const actor = await initAgent();
    console.log("Actor created, making write call...");
    
    const txResult = await actor.write_message(input.value);
    console.log("Write success:", txResult);
    
    input.value = "";
    await refreshMessages();
  } catch (error) {
    console.error("Write error:", error);
    alert(`Failed to post message: ${error.message}`);
  }
}

async function refreshMessages() {
  try {
    console.log("Refreshing messages...");
    const actor = await initAgent();
    
    console.log("Querying messages...");
    const messages = await actor.read_messages();
    console.log("Received messages:", messages);
    
    const list = document.getElementById("messageList");
    list.innerHTML = messages.map(msg => `<li>${msg}</li>`).join("");
  } catch (error) {
    console.error("Read error:", error);
    alert("Failed to load messages");
  }
}

// Debug network access
async function checkNetwork() {
  try {
    const response = await fetch(`${IC_HOST}/api/v2/status`);
    const status = await response.json();
    console.log("Network status:", status);
  } catch (error) {
    console.error("Network check failed:", error);
  }
}

// Initial load with debug
checkNetwork().then(refreshMessages);