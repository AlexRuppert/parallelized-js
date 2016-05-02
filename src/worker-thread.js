import {
  workerFunction
} from './worker-script.js';

/**
 * (description)
 * 
 * @export
 * @class WorkerThread
 */
export class WorkerThread {
  constructor(id = 0, finishCallback = () => {}) {
    this._worker = new Worker(WorkerThread.functionToUrl(workerFunction));

    this._worker.onmessage = (message) => {
      this._isRunning = false;
      this._finishCallback(this._id);
      this._resolve(message.data);
    };

    this._id = id;
    this._isRunning = false;
    this._resolve = Promise.resolve;
    this._finishCallback = finishCallback;
  }

  get id() {
    return this._id;
  }
  get isRunning() {
    return this._isRunning;
  }
  setRunning() {
    this._isRunning = true;
  }

  static generateId() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    return s4() + s4() + s4();
  }

  static functionToUrl(func) {
    return URL.createObjectURL(new Blob(['(',
      func.toString(),
      ')()',
    ], {
      type: 'application/javascript',
    }));
  }

  static functionToString(func, cache = false) {
    if (typeof func !== 'function') {
      throw new Error('Passed argument is not a function!');
    }

    if (func.name) {
      if (WorkerThread.functionCache.hasOwnProperty(func.name)) {
        const cachedFunc = WorkerThread.functionCache[func.name];
        return {
          fn: cachedFunc.fn,
          id: cachedFunc.id,
        };
      }
    }

    const fn = `(function(){ return ${func.toString()} })()`;
    let id = 0;
    if (cache && func.name) {
      id = WorkerThread.generateId();
      WorkerThread.functionCache[func.name] = {
        fn,
        id,
      };
    }
    return {
      fn,
      id,
    };
  }

  static flatSerializeArguments(args) {
    const result = [];
    for (let i = 0; i < args.length; i++) {
      if (typeof args[i] === 'function') {
        result.push(WorkerThread.functionToString(args[i], false).fn);
      } else {
        result.push(args[i]);
      }
    }
    return result;
  }

  setFunctions(functionDictionary) {
    const serializedFunctionDictionary = {};
    for (const key in functionDictionary) {
      if (functionDictionary.hasOwnProperty(key)) {
        const element = functionDictionary[key];
        serializedFunctionDictionary[key] = WorkerThread.functionToString(
          element,
          false).fn;
      }
    }

    this._worker.postMessage({
      type: 'setFunctions',
      payload: serializedFunctionDictionary,
    });
  }

  importScripts(urls) {
    this._worker.postMessage({
      type: 'importScripts',
      payload: urls,
    });
  }

  invoke(func, ...args) {
    const self = this;
    self._isRunning = true;
    return new Promise((resolve) => {
      const {
        fn,
        id,
      } = WorkerThread.functionToString(func, true);

      const serializedArgs = WorkerThread.flatSerializeArguments(args);
      self._worker.postMessage({
        type: 'invoke',
        payload: {
          fn,
          id,
          serializedArgs,
        },
      });
      self._resolve = resolve;
    });
  }

  arrayInvoke(func, array, ...args) {
    const self = this;
    self._isRunning = true;
    return new Promise((resolve) => {
      const {
        fn,
        id,
      } = WorkerThread.functionToString(func, true);

      const serializedArgs = WorkerThread.flatSerializeArguments(args);
      let bufferedArray;
      if (ArrayBuffer.isView(array)) {
        bufferedArray = array;
      } else if (Array.isArray(array) &&
        array.length > 0 && typeof array[
          0] === 'number') {
        bufferedArray = Float64Array.from(array);
      } else {
        throw new Error('Passed array is not an array of numbers!');
      }
      const message = {
        type: 'arrayInvoke',
        payload: {
          fn,
          id,
          array: bufferedArray,
          serializedArgs,
        },
      };

      self._worker.postMessage(message, [message.payload.array.buffer]);
      self._resolve = resolve;
    });
  }
}
WorkerThread.functionCache = {};
