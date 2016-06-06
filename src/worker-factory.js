import {
  WorkerThread
} from './worker-thread.js';

import {
  FakeWorkerThread
} from './fake-worker-thread.js';

/**
 * Factory to get the correct WorkerThread instance.
 * If Workers are not supported, {@link FakeWorkerThread} is returned, which emulates the Workers as single-threaded async calls.
 *
 * @export
 * @class WorkerFactory
 */
export class WorkerFactory {
  /**
   * Returns the appropriate instance to handle Worker tasks, depending of Worker support.
   *
   * @param {number} [id=0] The ID can be used to identify instences of WorkerThread.
   * @param {function(id: number, result: * )} [finishCallback] This function is invoked upon completing a task.
   * It is internally used for {@link WorkerManager} to track completion,
   * but you can use it for own purposes.
   * @returns WorkerThread instance, if Workers are supported, otherwise {@link FakeWorkerThread}.
   */
  static createWorker(id = 0, finishCallback = () => {}) {
    if (WorkerFactory.override) {
      return new FakeWorkerThread(id, finishCallback);
    }

    if (WorkerFactory.workersSupported()) {
      return new WorkerThread(id, finishCallback);
    }
    return new FakeWorkerThread(id, finishCallback);
  }

  /**
   * Returns, if Workers are supported by the browser.
   *
   * @static
   * @returns True, if Workers are supported.
   */
  static workersSupported() {
    return !!Worker;
  }
}
WorkerFactory.override = false;
