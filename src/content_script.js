const REQUEST = {
  SET: 0,
}
const RESPONSE = {
  NO: 0,
  YES: 1,
  ERROR: 2,
  GET_SPEED: 3
}

let videoElems = [];
let speed = 1.0;

chrome.extension.onMessage.addListener((request, sender, sendResponse) => {
  speed = request.speed;
  if (request.cmd === REQUEST.SET) {
    setSpeedOperate(speed);
  }
});

function postCommand(cmd) {
  return new Promise((resolve, reject) => {
    chrome.extension.sendMessage({ cmd }, (request) => {
      resolve(request);
    });
  });
}

async function setSpeedOperate(speed) {
  let cmd;
  try {
    await setSpeed(speed);
    await isWork(speed);
    cmd = RESPONSE.YES;
  } catch (e) {
    cmd = e;
  } finally {
    postCommand(cmd)
  }
}

async function setSpeed(speed) {
  return new Promise((resolve, reject) => {
    if (videoElems.length) {
      for (const video of videoElems) {
        video.playbackRate = speed;
      }
      resolve()
    } else {
      reject(RESPONSE.NO);
    }
  })
}

async function isWork(speed) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      for (const video of videoElems) {
        if (video.playbackRate !== speed) {
          reject(RESPONSE.ERROR);
          return;
        }
      }
      resolve();
    }, 0);
  })
}

function setSpeedOperateProxy() {
  videoElems = Array.from(document.querySelectorAll('video'))
  setSpeedOperate(speed)
}

function defender() {
  const observeWatcher = function () {
    let timer = null;
    return (mutationRecords) => {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      timer = setTimeout(() => {
        mutationRecords.every((record) => {
          if (record.type === 'childList') {
            const { addedNodes, removedNodes } = record;
            for (const node of addedNodes) {
              if (node.nodeName.toLowerCase() === 'video') {
                setSpeedOperateProxy();
                return false;
              }
            }
            for (const node of removedNodes) {
              if (node.nodeName.toLowerCase() === 'video') {
                setSpeedOperateProxy();
                return false;
              }
            }
          }
          return true;
        });
      }, 500);
    }
  }();
  const MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
  new MutationObserver(observeWatcher)
    .observe(document.body, {
      'childList': true,
      'subtree': true
      // attributes:true
    });
}

function watch() {
  const watcher = function () {
    let timer = null;
    return (e) => {
      const { nodeName, nodeType } = e.target.nodeType;
      if (nodeType === 1 && nodeName.toLowerCase() === 'video') {
        if (timer) {
          clearTimeout(timer);
          timer = null;
        }
        timer = setTimeout(setSpeedOperateProxy, 1000);
      }
    }
  }();
  document.body.addEventListener('DOMSubtreeModified', watcher);
}

async function initialize() {
  speed = await postCommand(RESPONSE.GET_SPEED);
  document.addEventListener('DOMContentLoaded', e => {
    setSpeedOperateProxy()
    watch();
  });
}

initialize();


