var videos = [];

chrome.extension.onMessage.addListener(function (request, sender, sendResponse) {
	if (request.cmd === "setPlaybackRate") {

		if (forceSetPlaybackRate.getStatus()) {
			forceSetPlaybackRate.start();
		} else {
			setPlaybackRate();
		}

	}
	if (request.cmd === 'forceSetPlaybackRate') {
		forceSetPlaybackRate.start();
	}
	if (request.cmd === 'forceStopPlaybackRate') {
		forceSetPlaybackRate.stop();
	}
});

var forceSetPlaybackRate = function () {
	var timer = null;
	function clear(){
		if (timer) {
			clearInterval(timer);
			timer = null;
		}
	}
	function stop() {
		clear();
		messageSender("GETRATE", function (playbackRate) {
			checkResult(videos,playbackRate);
		});
	}

	function start() {
		clear();
		var len = videos.length;
		if (len) {
			messageSender("FOECEFIND");
			messageSender("GETRATE", function (playbackRate) {
				timer = setInterval(function () {
					for (var i = 0; i < len; i++) {
						videos[i].playbackRate = playbackRate;
					}
				}, 0);
			});
		}else{
			messageSender("NOTFIND");
		}
	}

	function getStatus() {
		return !!timer;
	}
	return {
		start: start,
		stop: stop,
		getStatus: getStatus
	}
}();

function setPlaybackRate() {
	var len = videos.length;
	if (len) {
		messageSender("GETRATE", function (playbackRate) {
			for (var i = 0; i < len; i++) {
				videos[i].playbackRate = playbackRate;
			}
			checkResult(videos, playbackRate);
		});
	} else {
		messageSender("NOTFIND");
	}
}



function checkResult(videos, playbackRate) {
	setTimeout(function () {
		for (var i = 0, len = videos.length; i < len; i++) {
			if (videos[i].playbackRate !== playbackRate) {
				messageSender("ERROR");
				return;
			}
		}
		messageSender("FIND");
	}, 10);
}


function removeHandler() {
	document.body.removeEventListener('DOMSubtreeModified', watcher);
}


function messageSender(cmd, fn) {
	var req = { cmd: cmd };
	if (fn) {
		chrome.extension.sendMessage(req, fn);
	}
	else {
		chrome.extension.sendMessage(req);
	}
}

function getVideos() {
	videos = [].slice.call(document.getElementsByTagName("video"), 0);
	return videos.length;
}

function proxyHandler() {
	getVideos();
	messageSender("FIND");
	if(forceSetPlaybackRate.getStatus()){
		forceSetPlaybackRate.start();
	}else{
		setPlaybackRate();
	}
}


function observe() {
	var observeWatcher = function () {
		var timer = null;
		return function (mutationRecords) {
			if (timer) {
				clearTimeout(timer);
				timer = null;
			}
			timer = setTimeout(function () {
				mutationRecords.every(function (record) {
					if (record.type === 'childList') {
						var addNodes = record.addedNodes;
						var removeNodes = record.removedNodes;
						for (var i = 0, len = addNodes.length; i < len; i++) {
							if (addNodes[i].nodeName.toLowerCase() === 'video') {
								proxyHandler();
								return false;
							}
						}
						for (var j = 0, len = removeNodes.length; j < len; j++) {
							if (removeNodes[j].nodeName.toLowerCase() === 'video') {
								proxyHandler();
								return false;
							}
						}
					}
					return true;
				});
			}, 500);
		}
	}();

	var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
	var observe = new MutationObserver(observeWatcher);
	observe.observe(document.body, {
		'childList': true,
		'subtree': true
		
		// attributes:true
	});
}



function listen() {

	var watcher = function () {
		var timer = null;
		return function (e) {
			var tag = e.target;
			var tagType = tag.nodeType;
			var tagName = tag.nodeName.toLowerCase();
			if (tagType === 1 && tagName === 'video') {
				if (timer) {
					clearTimeout(timer);
					timer = null;
				}
				timer = setTimeout(proxyHandler, 5000);
			}
		}
	}();

	document.body.addEventListener('DOMSubtreeModified', watcher);

}

// observe();
listen();