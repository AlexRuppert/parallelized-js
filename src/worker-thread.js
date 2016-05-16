import {
  workerFunction
} from './worker-script.js';

/**
 * A WorkerThread abstracts the interaction with a Web
 * <a href="https://developer.mozilla.org/en/docs/Web/API/Worker">Worker</a>.
 * Functions can be scheduled to be run inside a Worker thread with a set of given parameters.
 * The class handles the required serializations and returns a Promise upon completion.
 * Please note the
 * <a href="http://www.html5rocks.com/en/tutorials/workers/basics/#toc-enviornment">restrictions</a>
 * of the Web Workers:
 * - no access to the DOM, window or document object
 * - no access to external functions, variables or scripts
 * - function parameters must be serializable (this class automatically serializes functions given as a parameter)
 * - all values are copied to the Worker context (not referenced), i.e. there might be a lot of overhead
 *
 * The copying of values can be avoided by using a
 * <a href="https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers#Passing_data_by_transferring_ownership_(transferable_objects)">TypedArray</a>
 * with {@link WorkerThread.arrayInvoke}.
 *
 * The Worker basically runs in a closed environment. With almost no access to the outside.
 * You can import external scripts using {@link WorkerThread.importScripts} or defined functions
 * using {@link WorkerThread.setFunctions} into the Worker context.
 *
 * @example
 * function mul(a, b) {
 *  return a * b;
 * }
 *
 * const thread = new WorkerThread();
 * thread.invoke(mul, 50, 2)
 *  .then((result) => {
 *    console.log(result);
 *  });
 *
 * @export
 * @class WorkerThread
 */
export class WorkerThread {
  /**
   * Creates an instance of WorkerThread.
   *
   * @param {number} [id=0] The ID can be used to identify instences of WorkerThread.
   * @param {function(id: number, result: * )} [finishCallback] This function is invoked upon completing a task.
   * It is internally used for {@link WorkerManager} to track completion,
   * but you can use it for own purposes.
   */
  constructor(id = 0, finishCallback = () => {}) {
    this._worker = new Worker(WorkerThread.functionToUrl(workerFunction));

    this._worker.onmessage = (message) => { // handle Worker response HERE
      this._isRunning = false;
      this._finishCallback(this._id, message.data);
      this._resolve(message.data);
    };

    this._id = id;
    this._isRunning = false;
    this._resolve = Promise.resolve;
    this._finishCallback = finishCallback;
  }

  /**
   * @type {number}
   *
   * @readonly
   */
  get id() {
    return this._id;
  }

  /**
   * @type {boolean}
   * @readonly
   */
  get isRunning() {
    return this._isRunning;
  }

  /**
   * Sets the WorkerThread as busy. Used by the {@link WorkerManager}.
   */
  setRunning() {
    this._isRunning = true;
  }

  /**
   * Serializes a function into a URL, which then can be imported, as if it was an external script.
   *
   * @static
   * @param {function} func Function to serialize.
   * @returns {string} Serialized function.
   */
  static functionToUrl(func) {
    return URL.createObjectURL(new Blob(['(', func.toString(), ')()'], {
      type: 'application/javascript'
    }));
  }

  /**
   * Serializes a function into a string that can be deserialized with eval.
   * Functions are cached by name. If a function is known by name, the cached string is directly returned.
   * Caching is disabled by default.
   *
   * @static
   * @param {function} func Function to serialize.
   * @param {boolean} [cache=false] If chaching based on function names should be used.
   * @returns {{fn: string, id: string}} The serialized function string and the id of the function.
   */
  static functionToString(func, cache = false) {
    if (typeof func !== 'function') {
      throw new Error('Passed argument is not a function!');
    }

    // check cache if func has a name and caching is allowed
    if (func.name && cache) {
      if (WorkerThread._functionCache.hasOwnProperty(func.name)) {
        const cachedFunc = WorkerThread._functionCache[func.name];
        return {
          fn: cachedFunc.fn,
          id: cachedFunc.id,
        };
      }
    }

    const fn = `(function(){ return ${func.toString()} })()`;
    let id = 0;
    // store values in cache if allowed
    if (cache && func.name) {
      id = func.name;
      WorkerThread._functionCache[func.name] = {
        fn,
        id,
      };
    }
    return {
      fn,
      id,
    };
  }

  /**
   * Makes function arguments serializable.
   * Converts functions to strings.
   *
   * @static
   * @param {*[]} args Array of arguments to serialize.
   * @returns {*[]} Array of serializable arguments.
   */
  static flatSerializeArguments(args) {
    const result = [];
    for (let i = 0; i < args.length; i++) {
      // serialize functions
      if (typeof args[i] === 'function') {
        result.push(WorkerThread.functionToString(args[i], false).fn);
      } else {
        result.push(args[i]);
      }
    }
    return result;
  }

  /**
   * Injects functions into the Worker context.
   * The functions can then be used inside the Worker from other functions.
   *
   * @param {Object<string, function>} functionDictionary An object with the function names as properties
   * and the functions themselves as values.
   *
   * @example
   * function mul(a, b) {
   *  return a * b;
   * }
   *
   * thread.setFunction({mul: mul});
   */
  setFunctions(functionDictionary) {
    const serializedFunctionDictionary = {};
    for (const key in functionDictionary) {
      if (functionDictionary.hasOwnProperty(key)) {
        const element = functionDictionary[key];
        // serialize given functions
        serializedFunctionDictionary[key] = WorkerThread.functionToString(
          element,
          false).fn;
      }
    }

    // give functions to Worker via message
    this._worker.postMessage({
      type: 'setFunctions',
      payload: serializedFunctionDictionary,
    });
  }

  /**
   * Loads scripts from the given URLs, which then can be used from within the Worker.
   *
   * @param {string[]} urls Array of script URLs to import.
   */
  importScripts(urls) {
    this._worker.postMessage({
      type: 'importScripts',
      payload: urls,
    });
  }

  /**
   * Invokes a given function with the given arguments as a Worker task.
   * Function and arguments are automatically serialized.
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
   * const thread = new WorkerThread();
   * thread.invoke(mul, 50, 2)
   *  .then((result) => {
   *    console.log(result);
   *  });
   */
  invoke(func, ...args) {
    const self = this;
    self._isRunning = true;
    return new Promise((resolve) => {
      // serialize func
      const {
        fn,
        id,
      } = WorkerThread.functionToString(func, true);

      // serialize arguments
      const serializedArgs = WorkerThread.flatSerializeArguments(args);

      // invoke
      self._worker.postMessage({
        type: 'invoke',
        payload: {
          fn,
          id,
          serializedArgs,
        },
      });
      // set local resolve callback to be called upon completion (onmessage event)
      self._resolve = resolve;
    });
  }

  /**
   * Similar to {@link WorkerThread.invoke}, but specially created for
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
   * const thread = new WorkerThread();
   * thread.arrayInvoke(plusOne, Int32Array.from(myArray))
   *  .then((result) => {
   *    console.log(result);
   *  });
   */
  arrayInvoke(func, array, ...args) {
    const self = this;
    self._isRunning = true;
    return new Promise((resolve) => {
      // serialize func
      const {
        fn,
        id,
      } = WorkerThread.functionToString(func, true);

      // serialize arguments
      const serializedArgs = WorkerThread.flatSerializeArguments(args);
      let bufferedArray;

      // check if array is a TypedArray and convert, if necessary/possible
      if (ArrayBuffer.isView(array)) {
        bufferedArray = array;
      } else if (Array.isArray(array) &&
        array.length > 0 && typeof array[
          0] === 'number') {
        bufferedArray = Float64Array.from(array);
      } else {
        throw new Error('Passed array is not an array of numbers!');
      }

      // prepare message
      const message = {
        type: 'arrayInvoke',
        payload: {
          fn,
          id,
          array: bufferedArray,
          serializedArgs,
        },
      };

      // invoke
      self._worker.postMessage(message, [message.payload.array.buffer]);
      self._resolve = resolve;
    });
  }
}
WorkerThread._functionCache = {};
