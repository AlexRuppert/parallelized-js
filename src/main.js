import {
  WorkerManager,
} from './worker-manager.js';

function mul(a, b) {
  return a * b;
}

const workerManager = new WorkerManager({
  extendArray: true,
});

/* workerManager.parallelArray.findIndex([1, 2, 3, 4, 5, 6, 7, 8],
    (val) => val === 5)
  .then((result) => {
    console.log(result);
  });*/

import {
  workerFunction,
} from './worker-script.js';

import {
  WorkerThread,
} from './worker-thread.js';

const worker = new Worker(WorkerThread.functionToUrl(workerFunction));

worker.onmessage = (message) => {
  //console.log(message.data);
  console.log(Date.now() - start1);
  console.log(message.data);
};
var start1;
const testArray1 = [];
for (let i = 0; i < 1000000; i++) {
  testArray1.push(i);
}
//console.log(Int32Array.from(testArray1).buffer.byteLength);

function addAll(array) {
  for (let i = 0; i < array.length; i++) {
    array[i] += 5;
  }
  return array;
}
const message = {
  type: 'arrayInvoke',
  payload: {
    fn: WorkerThread.functionToString(addAll).fn,
    id: 0,
    array: Int32Array.from(testArray1),
    serializedArgs: [],
  },
};
setTimeout(function () {
  start1 = Date.now();
  worker.postMessage(message, [message.payload.array.buffer]);
}, 500);
/*
const testArray1 = [];
for (let i = 0; i < 10000; i++) {
  testArray1.push(i);
}
let start = 0;
let end = 0;
const callbackFn = (val) => {
  let v = val;
  for (let k = 0; k < 10000; k++) {
    v += 1;
  }
  return val;
};

start = Date.now();
testArray1.map(callbackFn);
end = Date.now();

console.log(end - start);
console.log('---');
setTimeout(function () {
  start = Date.now();
  testArray1.parallelMap(callbackFn)
    .then((result) => {
      end = Date.now();
      console.log(end - start);
    });
}, 500);

/* workerManager.invoke(mul, 5, 7)
  .then((result) => {
    console.log(result);
  });
/*

/*
workerManager.parallelizedArray.indexOf()
  .then((result) => {
    console.log(result);
  });
/*
if (window.Worker) { // Check if Browser supports the Worker api.
  // Requries script name as input
  const w = new WorkerThread();
  const testFunc1 = (a, b) => {
    const result = a + b;
    return result;
  };

  w.invoke(testFunc1, 5, 7)
    .then((result) => {
      console.log(result);
    });
}
*/
