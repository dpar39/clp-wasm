}

var CLP = null;
// I'm a window... sad trombone.

if (typeof window === 'object') {

    function initwebworker(resolve) {

        let workerCode = `(${initialize.toString().trim()})()`;
        const objectUrl = URL.createObjectURL(new Blob([workerCode], { type: "text/javascript" }));
        const worker = new Worker(objectUrl);
        URL.revokeObjectURL(objectUrl);
        let callId = 0;
        const pendingPromises = new Map();

        let api = {
            solveAsync: async (problem, precision) => {
                return new Promise((accept, reject) => {
                    let currentId = callId++;
                    pendingPromises.set(currentId, accept);
                    worker.postMessage({ method: 'solve', args: [problem, precision], callId: currentId });
                });
            }
        };

        worker.onmessage = (e) => {
            if (!e.data) {
                return;
            }
            if (e.data.initialized) {
                console.log('Web Worker initialized!!!');
                resolve(api);
            } else {
                console.log(e);
                console.log(pendingPromises);
                pendingPromises.get(e.data.callId)(e.data.result);
                delete pendingPromises[e.data.callId];
            }
        };
    }
    CLP = new Promise(resolve => initwebworker(resolve));
}
else {
    CLP = new Promise(resolve => initialize(resolve));
}
if (typeof module !== 'undefined') module.exports = CLP;
if (typeof define === 'function') define(CLP);
