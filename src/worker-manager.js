import {
  WorkerThread
} from './worker-thread.js';

import {
  ParallelizedArray
} from './parallelized-array.js';

/**
 * This class manages a pool of {@link WorkerThread}s.
 * Tasks are automatically delegated to the next free WorkerThread.
 * Additionaly it offers access to {@link ParallelizedArray} for parallelizing array operations.
 *
 * @example
 * function mul(a, b) {
 *  return a * b;
 * }
 *
 * const manager = new WorkerManager();
 * manager.invoke(mul, 50, 2)
 *  .then((result) => {
 *    console.log(result);
 *  });
 *
 * manager.parallelArray.map(
 *  [2, 3, 5, 7, 11, 13, 17],
 *  (element) => (element + 1))
 *  .then((result) => {
 *    console.log(result);
 *  });
 *
 * @export
 * @class WorkerManager
 */
export class WorkerManager {
  /**
   * Creates an instance of WorkerManager.
   * An optional configuration object can be passed as an argument:
   * - maxParallelCount (default = 4): How many {@link WorkerThread}s can run at the same time (should be the amount of CPU cores).
   * - maxPoolCount (default = 4): How many instances of {@link WorkerThread} are created and managed in the pool.
   * - extendArray (default = false): If the Array prototype should be extended with methods of the {@link parallelArray}.
   *
   * @param {maxParallelCount: number, maxPoolCount: number, extendArray: boolean} [options] (description)
   */
  constructor(options = {}) {
    this._options = {
      maxParallelCount: 4,
      maxPoolCount: 4,
      extendArray: false,
    };

    // overwrite default values with given ones
    for (const key in options) {
      if (options.hasOwnProperty(key)) {
        this._options[key] = options[key];
      }
    }
    this._pool = [];
    this._queue = [];

    // create {@link WorkerThread}s for the pool
    for (let i = 0; i < this._options.maxPoolCount; i++) {
      this._pool.push(new WorkerThread(i, this._threadFinished.bind(this)));
    }

    // one instance of ParallelizedArray for use
    this._parallelArray = new ParallelizedArray(this, this._options.extendArray);
  }

  /**
   * @type {ParallelizedArray}
   *
   * @readonly
   */
  get parallelArray() {
    return this._parallelArray;
  }

  /**
   * @type {number}
   *
   * @readonly
   */
  get maxParallelCount() {
    return this._options.maxParallelCount;
  }

  /**
   * Callback invoked by {@link WorkerThread}s whenever they have completed their task.
   *
   * @param id The ID of the invoking {@link WorkerThread}.
   */
  _threadFinished(id) {
    if (this._queue.length > 0) {
      const resolve = this._queue.shift();
      resolve(this._pool[id]);
    }
  }

  /**
   * Retrieves the next free {@link WorkerThread} that is not busy.
   *
   * @returns {Promise<WorkerThread>} A free {@link WorkerThread}, ready to accept a new task.
   */
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

  /**
   * Makes functions available to all Worker contexts.
   *
   * @param {Object<string, function>} functionDictionary An object, where the keys define the names of the functions stored as the value.
   */
  setFunctions(functionDictionary) {
    for (let i = 0; i < this._pool.length; i++) {
      this._pool[i].setFunctions(functionDictionary);
    }
  }

  /**
   * Imports scripts to all Worker contexts via an array of URLs.
   *
   * @param {string[]} urls URLs of the scripts to import.
   */
  importScripts(urls) {
    for (let i = 0; i < this._pool.length; i++) {
      this._pool[i].importScripts(urls);
    }
  }

  /**
   * Makes functions available to all Worker contexts.
   *
   * @param functionArray Array of functions to be available in the Worker context.
   */
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

  /**
   * Invokes a given function with the given arguments as a Worker task.
   * Function and arguments are automatically serialized.
   * A free {@link WorkerThread} is automatically selected.
   * The result is given as a Promise.
   *
   * @param {function} func Function to invoke.
   * @param {...*} args Arguments for the function to be used in the invocation.
   * @returns {Promise<*>} The result of the function.
   *
   * @example
   * function mul(a, b) {
   *  return a * b;
   * }
   *
   * const manager = new WorkerManager();
   * manager.invoke(mul, 50, 2)
   *  .then((result) => {
   *    console.log(result);
   *  });
   */
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

  /**
   * Similar to {@link WorkerManager.invoke}, but specially created for
   * <a href="https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers#Passing_data_by_transferring_ownership_(transferable_objects)">TypedArray</a>s.
   * TypedArrays can be used as transferable objects, which can be passed as references to Workers
   * and do not need to be copied. This can improve performance significantly, especially for large data sets.
   * @param {function} func Function to invoke. It must accept an array as its first argument.
   * @param {TypedArray} array Array to work on. Normal number arrays are also supported.
   * @param {...*} args Arguments for the function to be used in the invocation.
   * @returns {Promise<*>} The result of the function.
   *
   * @example
   * function plusOne(array) {
   *  for (let i = 0; i < array.length; i++) {
   *    array[i] += 1;
   *  }
   *  return array;
   * }
   *
   * let myArray = [];
   * for (let i = 0; i < 1000000; i++) {
   *  myArray.push(i);
   * }
   *
   * const manager = new WorkerManager();
   * manager.arrayInvoke(plusOne, Int32Array.from(myArray))
   *  .then((result) => {
   *    console.log(result);
   *  });
   */
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
