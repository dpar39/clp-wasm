}

var CLP = null;
function isBrowser() {
  if (typeof process === "object" &&
      typeof require === "function") {
      return false;
  }
  if (typeof importScripts === "function") {
      return false;
  }
  return typeof window === "object";
}

if (isBrowser()) {
  function initWebWorker(resolve) {
    let workerCode = `(${initialize.toString().trim()})()`;
    const objectUrl = URL.createObjectURL(new Blob([workerCode], { type: "text/javascript" }));
    const worker = new Worker(objectUrl);
    URL.revokeObjectURL(objectUrl);
    let callId = 0;
    const pendingPromises = new Map();

    function makeMethod(methodName) {
      return async function () {
        let args = [];
        for (let k = 0; k < arguments.length; ++k) { args.push(arguments[k]); }
        return new Promise(accept => {
          let currentId = callId++;
          pendingPromises.set(currentId, accept);
          worker.postMessage({ method: methodName, args: args, callId: currentId });
        });
      }
    }
    let api = {
      solve: makeMethod('solve'),
      version: makeMethod('version'),
      bnCeil: makeMethod('bnCeil'),
      bnFloor: makeMethod('bnFloor'),
      bnRound: makeMethod('bnRound')
    };
    worker.onmessage = (e) => {
      if (!e.data) {
        return;
      }
      if (e.data.initialized) {
        resolve(api);
      } else {
        pendingPromises.get(e.data.callId)(e.data.result);
        delete pendingPromises[e.data.callId];
      }
    };
  }
  CLP = new Promise(resolve => initWebWorker(resolve));
}
else {
  CLP = new Promise(resolve => initialize(resolve));
}
if (typeof module !== 'undefined') module.exports = CLP;
if (typeof define === 'function') define(CLP);
