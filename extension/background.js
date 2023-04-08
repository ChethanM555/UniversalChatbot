chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason == "install" || details.reason == "update") {
    // Show popup to get key
    chrome.windows.create({
      url: "settings.html",
      type: "popup",
      width: 400,
      height: 400
    });
  }
});
