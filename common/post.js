}

var CLP = null;

// I'm a window... sad trombone.
if (typeof window === 'object') {

    function initwebworker(resolve) {

        let workerCode = `(${initialize.toString().trim()})()`;
        const objectUrl = URL.createObjectURL(new Blob([workerCode], { type: "text/javascript" }));
        const worker = new Worker(objectUrl);
        URL.revokeObjectURL(objectUrl);
        let id = 0;

        let api = {
            solveAsync: async (problem, precision) => {
                return new Promise((accept, reject) => {
                    pendingPromises.set(id++, accept);
                    worker.postMessage({ method: 'solve', args: [problem, precision] });
                });
            }
        }

        let pendingPromises = new Map();
        worker.onmessage = (e) => {
            if (!e.data) {
                return;
            }
            if (e.data.initialized) {
                console.log('Web Worker initialized!!!')
                resolve(api)
            } else if (e.data.result) {
                pendingPromises[id](e.data.result);
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
