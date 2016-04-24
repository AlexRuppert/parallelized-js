import {
  WorkerThread,
} from './worker-thread.js';

import {
  ParallelizedArray,
} from './parallelized-array.js';

export class WorkerManager {
  constructor(options = {}) {
    this._options = {
      maxParallelCount: 4,
      maxPoolCount: 8,
      extendArray: false,
    };

    for (const key in options) {
      if (options.hasOwnProperty(key)) {
        this._options[key] = options[key];
      }
    }
    this._pool = [];
    this._queue = [];
    for (let i = 0; i < this._options.maxPoolCount; i++) {
      this._pool.push(new WorkerThread(i, this.threadFinished.bind(this)));
    }
    this._parallelArray = new ParallelizedArray(this, this._options.extendArray);
  }

  get parallelArray() {
    return this._parallelArray;
  }
  get maxParallelCount() {
    return this._options.maxParallelCount;
  }

  threadFinished(id) {
    if (this._queue.length > 0) {
      const resolve = this._queue.shift();
      resolve(this._pool[id]);
    }
  }

  getNextFreeWorkerThread() {
    const self = this;
    return new Promise((resolve) => {
      let found = false;
      for (let i = 0; i < self._pool.length; i++) {
        if (!self._pool[i].isRunning) {
          found = true;
          self._pool[i].setRunning();
          resolve(self._pool[i]);
          break;
        }
      }
      if (!found) {
        self._queue.push(resolve);
      }
    });
  }

  setFunctions(functionDictionary) {
    for (let i = 0; i < this._pool.length; i++) {
      this._pool[i].setFunctions(functionDictionary);
    }
  }

  importScripts(urls) {
    for (let i = 0; i < this._pool.length; i++) {
      this._pool[i].importScripts(urls);
    }
  }

  setNamedFunctions(functionArray) {
    const functionDictionary = {};
    if (typeof functionArray === 'function') {
      functionArray = [functionArray]; // eslint-disable-line
    }
    for (let i = 0; i < functionArray.length; i++) {
      const element = functionArray[i];
      if (typeof element === 'function' && element.name) {
        functionDictionary[element.name] = element;
      }
    }
    this.setFunctions(functionDictionary);
  }

  invoke(func, ...args) {
    const self = this;
    return new Promise((resolve) => {
      self.getNextFreeWorkerThread()
        .then((workerThread) => {
          workerThread.invoke.apply(workerThread, [func].concat(args))
            .then((result) => {
              resolve(result);
            });
        });
    });
  }

  arrayInvoke(func, array, ...args) {    
    const self = this;
    return new Promise((resolve) => {
      self.getNextFreeWorkerThread()
        .then((workerThread) => {
          workerThread.arrayInvoke.apply(workerThread, [func, array].concat(
              args))
            .then((result) => {
              resolve(result);
            });
        });
    });
  }
}
