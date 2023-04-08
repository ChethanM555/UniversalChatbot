// Get all text content in the webpage
const textContent = document.body.innerText;

// Convert the text content into a JSON object that preserves the webpage structure
const jsonContent = JSON.stringify({
  url: window.location.href,
  content: textContent,
});

// Send the JSON object to the background script
chrome.runtime.sendMessage({ type: "content", data: jsonContent });
