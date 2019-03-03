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
  if (request.cmd === REQUEST.SET) {
    speed = request.speed;
    setSpeed(speed);
  }
});

function postCommand(cmd, cb) {
  chrome.extension.sendMessage({ cmd }, (request) => {
    cb && cb(request);
  });
}

function setSpeed(speed, cb) {
  if (videoElems.length) {
    postCommand(RESPONSE.YES)
    for (const video of videoElems) {
      video.playbackRate = speed;
    }
    isWork(speed, e => {
      if (!e) {
        postCommand(RESPONSE.ERROR);
      }
    })
  } else {
    postCommand(RESPONSE.NO)
  }
}

function isWork(speed, cb) {
  setTimeout(() => {
    let cmd = RESPONSE.YES;
    for (const video of videoElems) {
      if (video.playbackRate !== speed) {
        cmd = RESPONSE.ERROR
        break;
      }
    }
    cb && cb(cmd)
  }, 10);
}

function setSpeedOperateProxy() {
  videoElems = Array.from(document.querySelectorAll('video'))
  setSpeed(speed)
}


function watch() {
  const watcher = function () {
    let timer = null;
    return (e) => {
      const { nodeName, nodeType } = e.target;
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

function initialize() {
  postCommand(RESPONSE.GET_SPEED, request => {
    speed = request;
    watch();
  });
}

initialize();


// function defender() {
//   const observeWatcher = function () {
//     let timer = null;
//     return (mutationRecords) => {
//       if (timer) {
//         clearTimeout(timer);
//         timer = null;
//       }
//       timer = setTimeout(() => {
//         mutationRecords.every((record) => {
//           if (record.type === 'childList') {
//             const { addedNodes, removedNodes } = record;
//             for (const node of addedNodes) {
//               if (node.nodeName.toLowerCase() === 'video') {
//                 setSpeedOperateProxy();
//                 return false;
//               }
//             }
//             for (const node of removedNodes) {
//               if (node.nodeName.toLowerCase() === 'video') {
//                 setSpeedOperateProxy();
//                 return false;
//               }
//             }
//           }
//           return true;
//         });
//       }, 500);
//     }
//   }();
//   const MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
//   new MutationObserver(observeWatcher)
//     .observe(document.body, {
//       'childList': true,
//       'subtree': true
//       // attributes:true
//     });
// }



