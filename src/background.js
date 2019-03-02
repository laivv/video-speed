let speed = 1.0;
chrome.extension.onMessage.addListener((request, sender, sendResponse) => {
  if (request.cmd === 3) {
    sendResponse(speed);
  }
});
