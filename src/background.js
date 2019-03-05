let speed = 1;
chrome.extension.onMessage.addListener((request, sender, sendResponse) => {
  if (request.cmd === 3) {
    sendResponse(speed);
  }
});
