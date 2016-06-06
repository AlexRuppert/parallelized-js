import {
  WorkerThread
} from './worker-thread.js';

/**
 * A FakeWorkerThread is a fallback for working with Web Workers in browsers without proper support and emulates {@link RealWorkerThread}.
 * It is automatically used in {@link WorkerThread} for unsupported browsers, so you do not have to worry about it in your own implementation.
 *
 * @example
 * function mul(a, b) {
 *  return a * b;
 * }
 *
 * const thread = new FakeWorkerThread();
 * thread.invoke(mul, 50, 2)
 *  .then((result) => {
 *    console.log(result);
 *  });
 *
 * @export
 * @class FakeWorkerThread
 */
export class FakeWorkerThread extends WorkerThread {
  /**
   * Creates an instance of FakeWorkerThread.
   *
   * @param {number} [id=0] The ID can be used to identify instances of FakeWorkerThread.
   * @param {function(id: number, result: * )} [finishCallback] This function is invoked upon completing a task.
   * It is internally used for {@link WorkerManager} to track completion,
   * but you can use it for own purposes.
   */
  constructor(id = 0, finishCallback = () => {}) {
    super(id, finishCallback, false);
    this._worker = {};

    this._id = id;
    this._isRunning = false;
    this._resolve = Promise.resolve;
    this._finishCallback = finishCallback;
    this._window = {};
  }

  get window() {
    return this._window;
  }

  setFunctions(functionDictionary) {
    for (const key in functionDictionary) {
      if (functionDictionary.hasOwnProperty(key)) {
        const element = functionDictionary[key];
        this._window[key] = element;
      }
    }
  }

  importScripts(urls) {
    const head = document.getElementsByTagName('head')[0];
    const promises = [];

    return new Promise((resolve) => {
      for (let i = 0; i < urls.length; i++) {
        promises.push(new Promise((resolveInner) => {
          const url = urls[i];

          const script = document.createElement('script');
          script.type = 'text/javascript';
          script.src = url;

          // Then bind the event to the callback function.
          // There are several events for cross browser compatibility.
          script.onreadystatechange = resolveInner;
          script.onload = resolveInner;

          // Fire the loading
          head.appendChild(script);
        }));
      }

      Promise.all(promises).then(() => {
        resolve();
      });
    });
  }

  invoke(func, ...args) {
    const self = this;
    self._isRunning = true;
    return new Promise((resolve) => {
      const fn = func;
      // invoke
      setTimeout(() => {
        const result = fn.apply(window, args);
        this._isRunning = false;
        this._finishCallback(this._id, result);
        resolve(result);
      }, 0);
    });
  }

  arrayInvoke(func, array, ...args) {
    return this.invoke.apply(this, [func, array].concat(args));
  }
}
