const chatWindow = document.getElementById("chatWindow");
const statusWindow = document.getElementById("status");

// const pingButton = document.querySelector("#ping");
// pingButton.addEventListener("click", async () => {
//   await pingServer();
// });

// async function pingServer() {
//   var url = "http://localhost:3000/";

//   // Making our request
//   fetch(url, {
//     method: "GET",
//   })
//     .then((Result) => Result.json())
//     .then((Result) => {
//       // output our response
//       statusWindow.value = Result.message;
//     })
//     .catch((errorMsg) => {
//       statusWindow.value = errorMsg;
//     });
// }

window.onload = async function() {
  var url = "http://localhost:3000/chatHistory";

  fetch(url, {
    method: "GET",
  })
    .then((Result) => Result.json())
    .then((Result) => {
      statusWindow.value = Result.message;
      var chatHistory = "";
      for (var i = 0; i < Result.chatHistory.length; i++) {
        if (Result.chatHistory[i].user) {
          chatHistory += "User: " + Result.chatHistory[i].user + "\n";
        } else if (Result.chatHistory[i].chatbot) {
          chatHistory += "Chatbot: " + Result.chatHistory[i].chatbot + "\n";
        }
      }
      chatWindow.value = chatHistory;
    })
    .catch((errorMsg) => {
      //statusWindow.value = errorMsg;
    });
};

const setupButton = document.querySelector("#setup");
setupButton.addEventListener("click", async () => {
  await setupServer();
});

async function setupServer() {
  var url = "http://localhost:3000/setup";

  var docText = await getDocumentText();

  fetch(url, {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json"
    },

    //make sure to serialize your JSON body
    body: JSON.stringify({
      docText: docText,
    }),
  })
    .then((Result) => Result.json())
    .then((Result) => {
      statusWindow.value = Result.message;
    })
    .catch((errorMsg) => {
      statusWindow.value = errorMsg;
    });
}

const sendChatButton = document.querySelector("#sendChat");
sendChatButton.addEventListener("click", async () => {
  var query = document.getElementById("chatInput").value;
  document.getElementById("chatInput").value = "";
  await sendChat(query);
});

async function sendChat(query) {
  var url = "http://localhost:3000/chat";

  chatWindow.value += "User: " + query + "\n";

  fetch(url, {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json"
    },

    //make sure to serialize your JSON body
    body: JSON.stringify({
      query: query,
    }),
  })
    .then((Result) => Result.json())
    .then((Result) => {
      statusWindow.value = Result.message;
      chatWindow.value += "Chatbot: " + Result.answer + "\n";
    })
    .catch((errorMsg) => {
      statusWindow.value = errorMsg;
    });
}

const clearChatButton = document.querySelector("#clearChat");
clearChatButton.addEventListener("click", async () => {
  await clearChat();
  chatWindow.value = "";
});

async function clearChat() {
  var url = "http://localhost:3000/clear";

  fetch(url, {
    method: "GET",
  })
    .then((Result) => Result.json())
    .then((Result) => {
      statusWindow.value = Result.message;
    })
    .catch((errorMsg) => {
      statusWindow.value = errorMsg;
    });
}

async function getDocumentText() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  let res;
  try {
    res = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: inContent,
    });
  } catch (e) {
    console.warn(e.message || e);
    return;
  }
  // res[0] contains results for the main page of the tab
  return res[0].result;
}

// executeScript runs this code inside the tab
function inContent() {
  return {
    success: true,
    html: document.body.innerHTML,
  };
}
