/**
 * This class enables to work on arrays in parallel.
 * It uses the {@link WorkerManager} to utilize Web Workers.
 * Depending on the configuration in the constructor, it can extend the prototype of Array and TypedArray
 * with functions that utilize parallelization, such as parallelMap.
 *
 * @example
 * [1, 2, 3].parallelMap((element) => (element + 1))
 *  .then((result) => {
 *    console.log(result);
 *  });
 *
 * @export
 * @class ParallelizedArray
 */
export class ParallelizedArray {
  /**
   * Creates an instance of ParallelizedArray.
   *
   * @param {WorkerManager} workerManager The {@link WorkerManager} instance to use.
   * @param {boolean} [extendArray=false] Whether to extend the prototypes of Array and TypedArray.
   */
  constructor(workerManager, extendArray = false) {
    this._workerManager = workerManager;

    if (extendArray) {
      const self = this;
      /*eslint-disable */
      const prototypes = [
        Int8Array.prototype,
        Uint8Array.prototype,
        Int16Array.prototype,
        Uint16Array.prototype,
        Int32Array.prototype,
        Uint32Array.prototype,
        Float32Array.prototype,
        Float64Array.prototype,
        Array.prototype
      ]

      // function names defined here to apply to the prototype
      const funcs = [
        'indexOf',
        'every',
        'some',
        'filter',
        'find',
        'findIndex',
        'map'
      ]

      // helper function: each function gets the prefix 'parallel' before adding it to the prototype
      function setFunction(proto, funcName) {
        proto['parallel' + funcName.charAt(0).toUpperCase() + funcName.slice(
          1)] = function (callback, thisArg) {
          return self[funcName](this, callback, thisArg);
        };
      }

      for (let i = 0; i < prototypes.length; i++) {
        const proto = prototypes[i];

        for (let j = 0; j < funcs.length; j++) {
          setFunction(proto, funcs[j]);
        }
      }
      
      /*eslint-enable */
    }
  }

  /**
   * Creates partitions of an array based on the amount of threads that can run in parallel.
   *
   * @see WorkerManager.maxParallelCount
   *
   * @param {number} length The length of the array to partition.
   * @returns {Array<number[]> Array of partitions. Each partition is a two-element number array,
   * where the first number is the start and the second the end index.
   */
  _partitionArrayIndexes(length) {
    const parallelCount = this._workerManager.maxParallelCount;
    const mod = length % parallelCount;
    let div = Math.floor(length / parallelCount);
    const result = [];

    let startIndex = 0;
    if (mod !== 0) {
      div++; // as there is a modulo > 0, put a bit more into each partition
      for (let i = 0; i < parallelCount - 1; i++) {
        result.push([startIndex, startIndex + div - 1]);
        startIndex += div;
      }
      // partition for the remaining ranges
      result.push([startIndex, length - 1]);
    } else {
      for (let i = 0; i < parallelCount; i++) {
        result.push([startIndex, startIndex + div - 1]);
        startIndex += div;
      }
    }
    return result;
  }

  /**
   * Runs a task in parallel.
   *
   * @param {*[]} args Arguments for the parallel task.
   * @returns {?Promise<*>} The result of the parallel task.
   */
  _createThread(args) {
    if (args !== null) {
      if (ArrayBuffer.isView(args[1])) {
        return this._workerManager.arrayInvoke.apply(this._workerManager,
          args);
      }
      return this._workerManager.invoke.apply(this._workerManager, args);
    }
    return null;
  }

  /**
   * Flattens an Array or TypedArray.
   * @example
   * [[1], [2]] => [1, 2]
   *
   * @param {Array<*[]>} arrayOfArrays Array to flatten.
   * @returns {*[]} Flattened array.
   */
  _flattenArray(arrayOfArrays) {
    let result = [];
    if (arrayOfArrays.length === 0) {
      return [];
    }
    // check if it is a TypedArray
    if (ArrayBuffer.isView(arrayOfArrays[0])) {
      // get overall length
      let length = 0;
      for (let i = 0; i < arrayOfArrays.length; i++) {
        length += arrayOfArrays[i].length;
      }

      // create new Object based on used type and the expected length
      let typedArray;
      let arrayType = Object.prototype.toString.call(arrayOfArrays[0]);
      arrayType = arrayType.substring(8, arrayType.length - 1);
      /* beautify ignore:start */
      switch (arrayType) {
        case 'Int8Array':
          typedArray = new Int8Array(length);
          break;
        case 'Uint8Array':
          typedArray = new Uint8Array(length);
          break;
        case 'Uint8ClampedArray':
          typedArray = new Uint8ClampedArray(length);
          break;
        case 'Int16Array':
          typedArray = new Int16Array(length);
          break;
        case 'Uint16Array':
          typedArray = new Uint16Array(length);
          break;
        case 'Int32Array':
          typedArray = new Int32Array(length);
          break;
        case 'Uint32Array':
          typedArray = new Uint32Array(length);
          break;
        case 'Float32Array':
          typedArray = new Float32Array(length);
          break;
        default:
          typedArray = new Float64Array(length);
          break;
      }
      /* beautify ignore:end */

      // copy values into new array
      typedArray.set(arrayOfArrays[0]);
      let offset = 0;
      for (let i = 1; i < arrayOfArrays.length; i++) {
        offset += arrayOfArrays[i - 1].length;
        typedArray.set(arrayOfArrays[i], offset);
      }
      return typedArray;
    }

    // If not a TypedArray
    for (let i = 0; i < arrayOfArrays.length; i++) {
      result = result.concat(arrayOfArrays[i]);
    }
    return result;
  }

  /**
   * Finds the lowest positive index in a partitioned result.
   *
   * @param {number[]} results Array of result indexes.
   * @param {Array<number[]>} partition Array of partitions. Each partition is a two-element number array,
   * where the first number is the start and the second the end index.
   * @see ParallelizedArray._partitionArrayIndexes
   * @returns {number} Lowest positive index. -1, if no positive index was found.
   */
  _findMinimumIndex(results, partition) {
    let minimum = Number.MAX_VALUE;
    for (let i = 0; i < results.length; i++) {
      if (results[i] <= -1) {
        continue;
      }
      // add offset of the responsible partition (all results are 0 based)
      const index = results[i] + partition[i][0];
      if (index < minimum) {
        minimum = index;
      }
    }
    // nothing found
    if (minimum === Number.MAX_VALUE) {
      return -1;
    }
    return minimum;
  }

  /**
   * Executes a function on an array in parallel.
   * The array is automatically partitioned and the results of each WorkerThread are then combined.
   *
   * @param {*[]} array Array on which to operate.
   * @param {function(subArray: *[], startIndex: number, endIndex: number): *[]} partitionFunction Function that
   * generates an array of parameters for {@link ParallelizedArray._createThread} for each partition of the array.
   * The first argument is a function, to apply, the other arguments are the parameters for this function.
   *
   * @param {function(results: *[], partition: Array<number[]>): *} combinationFunction Function used to combine the results of each WorkerThread into a single result.
   * @returns {Promise<*>} Result of the array operation.
   */
  fragmentOperation(array, partitionFunction, combinationFunction) {
    const self = this;
    let checkedArray;
    if (!ArrayBuffer.isView(array) && Array.isArray(array) && array.length >
      0 && typeof array[
        0] === 'number') {
      checkedArray = Float64Array.from(array);
    } else {
      checkedArray = array;
    }

    return new Promise((resolve) => {
      const partition = self._partitionArrayIndexes(checkedArray.length);
      const threads = [];
      partition.forEach((part) => {
        const subArray = checkedArray.slice(part[0], part[1] + 1);
        const thread = this._createThread(partitionFunction(
          subArray,
          part[0], part[1]));
        if (thread) {
          threads.push(thread);
        }
      });

      Promise.all(threads)
        .then((results) => {
          resolve(combinationFunction(results, partition));
        });
    });
  }

  /**
   * Helper function, since the partitionFunction is often similar.
   *
   * @param {string} fragment Name of the function that should be applied to the array. 'Fragment' is automatically appended:
   * 'map' -> _mapFragment.
   * @param {function} callback Function callback.
   * @param {Object} thisArg The object, that should be used as 'this' in the invoked function.
   * @returns {function(subArray: *[], startIndex: number, endIndex: number): *[]} A partitionFunction for {@link ParallelizedArray.fragmentOperation}.
   */
  _withCallback(fragment, callback, thisArg) {
    return (subArray) => [
      this['_' + fragment + 'Fragment'],
      subArray,
      callback,
      thisArg,
    ];
  }

  /**
   * Fragment function for {@link ParallelizedArray.indexOf}.
   */
  _indexOfFragment(subArray, searchElement, fromIndex = 0) {
    return subArray.indexOf(searchElement, fromIndex);
  }

  /**
   * @see <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf">Array.prototype.indexOf</a>
   *
   * @returns Promise<number>
   */
  indexOf(array, searchElement, fromIndex = 0) {
    return this.fragmentOperation(array,
      (subArray, firstIndex, lastIndex) => {
        if (lastIndex < fromIndex) {
          return null;
        }
        const fromIndexAdjusted = Math.max(fromIndex - firstIndex, 0);
        return [
          this._indexOfFragment,
          subArray,
          searchElement,
          fromIndexAdjusted,
        ];
      },
      (results, partition) => this._findMinimumIndex(results, partition)
    );
  }

  /**
   * Fragment function for {@link ParallelizedArray.every}.
   */
  _everyFragment(subArray, callback, thisArg) {
    return subArray.every(callback, thisArg);
  }

  /**
   * @see <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/every">Array.prototype.every</a>
   *
   * @returns Promise<boolean>
   */
  every(array, callback, thisArg = null) {
    return this.fragmentOperation(array,
      this._withCallback('every', callback, thisArg),
      (results) => results.every((item) => item === true)
    );
  }

  /**
   * Fragment function for {@link ParallelizedArray.some}.
   */
  _someFragment(subArray, callback, thisArg) {
    return subArray.some(callback, thisArg);
  }

  /**
   * @see <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/some">Array.prototype.some</a>
   *
   * @returns Promise<boolean>
   */
  some(array, callback, thisArg = null) {
    return this.fragmentOperation(array,
      this._withCallback('some', callback, thisArg),
      (results) => results.some((item) => item === true)
    );
  }

  /**
   * Fragment function for {@link ParallelizedArray.filter}.
   */
  _filterFragment(subArray, callback, thisArg) {
    return subArray.filter(callback, thisArg);
  }

  /**
   * @see <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter">Array.prototype.filter</a>
   *
   * @returns Promise<*[]>
   */
  filter(array, callback, thisArg = null) {
    return this.fragmentOperation(array,
      this._withCallback('filter', callback, thisArg),
      (results) => this._flattenArray(results)
    );
  }

  /**
   * Fragment function for {@link ParallelizedArray.find}.
   */
  _findFragment(subArray, callback, thisArg) {
    return subArray.find(callback, thisArg);
  }

  /**
   * @see <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find">Array.prototype.find</a>
   *
   * @returns Promise<*>
   */
  find(array, callback, thisArg = null) {
    return this.fragmentOperation(array,
      this._withCallback('find', callback, thisArg),
      (results) => {
        for (let i = 0; i < results.length; i++) {
          const result = results[i];
          if (typeof result !== 'undefined') {
            return result;
          }
        }
        return undefined;
      }
    );
  }

  /**
   * Fragment function for {@link ParallelizedArray.findIndex}.
   */
  _findIndexFragment(subArray, callback, thisArg) {
    return subArray.findIndex(callback, thisArg);
  }

  /**
   * @see <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/findIndex">Array.prototype.findIndex</a>
   *
   * @returns Promise<number>
   */
  findIndex(array, callback, thisArg = null) {
    return this.fragmentOperation(array,
      this._withCallback('findIndex', callback, thisArg),
      (results, partition) => this._findMinimumIndex(results, partition)
    );
  }

  /**
   * Fragment function for {@link ParallelizedArray.map}.
   */
  _mapFragment(subArray, callback, thisArg) {
    return subArray.map(callback, thisArg);
  }

  /**
   * @see <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map">Array.prototype.map</a>
   *
   * @returns Promise<*[]>
   */
  map(array, callback, thisArg = null) {
    return this.fragmentOperation(array,
      this._withCallback('map', callback, thisArg),
      (results) => this._flattenArray(results)
    );
  }
}
