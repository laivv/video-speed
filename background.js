var playbackRate = 1.0;

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
       if(request.cmd === 'GETRATE'){
       		sendResponse(playbackRate);
       }
    }
);
