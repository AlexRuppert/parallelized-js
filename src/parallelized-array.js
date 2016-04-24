export class ParallelizedArray {
  constructor(workerManager, extendArray) {
    this._workerManager = workerManager;

    if (extendArray) {
      const self = this;
      /*eslint-disable */
      Int8Array.prototype.parallelIndexOf =
        Uint8Array.prototype.parallelIndexOf =
        Uint8ClampedArray.prototype.parallelIndexOf =
        Int16Array.prototype.parallelIndexOf =
        Uint16Array.prototype.parallelIndexOf =
        Int32Array.prototype.parallelIndexOf =
        Uint32Array.prototype.parallelIndexOf =
        Float32Array.prototype.parallelIndexOf =
        Float64Array.prototype.parallelIndexOf =
        Array.prototype.parallelIndexOf = function (searchElement, fromIndex =
          0) {
          return self.indexOf(this, searchElement, fromIndex);
        };
      Int8Array.prototype.parallelEvery =
        Uint8Array.prototype.parallelEvery =
        Uint8ClampedArray.prototype.parallelEvery =
        Int16Array.prototype.parallelEvery =
        Uint16Array.prototype.parallelEvery =
        Int32Array.prototype.parallelEvery =
        Uint32Array.prototype.parallelEvery =
        Float32Array.prototype.parallelEvery =
        Float64Array.prototype.parallelEvery =
        Array.prototype.parallelEvery = function (callback, thisArg = null) {
          return self.every(this, callback, thisArg);
        };
      Int8Array.prototype.parallelSome =
        Uint8Array.prototype.parallelSome =
        Uint8ClampedArray.prototype.parallelSome =
        Int16Array.prototype.parallelSome =
        Uint16Array.prototype.parallelSome =
        Int32Array.prototype.parallelSome =
        Uint32Array.prototype.parallelSome =
        Float32Array.prototype.parallelSome =
        Float64Array.prototype.parallelSome =
        Array.prototype.parallelSome = function (callback, thisArg = null) {
          return self.some(this, callback, thisArg);
        };
      Int8Array.prototype.parallelFilter =
        Uint8Array.prototype.parallelFilter =
        Uint8ClampedArray.prototype.parallelFilter =
        Int16Array.prototype.parallelFilter =
        Uint16Array.prototype.parallelFilter =
        Int32Array.prototype.parallelFilter =
        Uint32Array.prototype.parallelFilter =
        Float32Array.prototype.parallelFilter =
        Float64Array.prototype.parallelFilter =
        Array.prototype.parallelFilter = function (callback, thisArg = null) {
          return self.filter(this, callback, thisArg);
        };
      Int8Array.prototype.parallelFind =
        Uint8Array.prototype.parallelFind =
        Uint8ClampedArray.prototype.parallelFind =
        Int16Array.prototype.parallelFind =
        Uint16Array.prototype.parallelFind =
        Int32Array.prototype.parallelFind =
        Uint32Array.prototype.parallelFind =
        Float32Array.prototype.parallelFind =
        Float64Array.prototype.parallelFind =
        Array.prototype.parallelFind = function (callback, thisArg = null) {
          return self.find(this, callback, thisArg);
        };
      Int8Array.prototype.parallelFindIndex =
        Uint8Array.prototype.parallelFindIndex =
        Uint8ClampedArray.prototype.parallelFindIndex =
        Int16Array.prototype.parallelFindIndex =
        Uint16Array.prototype.parallelFindIndex =
        Int32Array.prototype.parallelFindIndex =
        Uint32Array.prototype.parallelFindIndex =
        Float32Array.prototype.parallelFindIndex =
        Float64Array.prototype.parallelFindIndex =
        Array.prototype.parallelFindIndex = function (callback, thisArg =
          null) {
          return self.findIndex(this, callback, thisArg);
        };
      Int8Array.prototype.parallelMap =
        Uint8Array.prototype.parallelMap =
        Uint8ClampedArray.prototype.parallelMap =
        Int16Array.prototype.parallelMap =
        Uint16Array.prototype.parallelMap =
        Int32Array.prototype.parallelMap =
        Uint32Array.prototype.parallelMap =
        Float32Array.prototype.parallelMap =
        Float64Array.prototype.parallelMap =
        Array.prototype.parallelMap = function (callback, thisArg = null) {
          return self.map(this, callback, thisArg);
        };
      /*eslint-enable */
    }
  }

  _partitionArrayIndexes(length) {
    const parallelCount = this._workerManager.maxParallelCount;
    const mod = length % parallelCount;
    let div = Math.floor(length / parallelCount);
    const result = [];

    let startIndex = 0;
    if (mod !== 0) {
      div++;
      for (let i = 0; i < parallelCount - 1; i++) {
        result.push([startIndex, startIndex + div - 1]);
        startIndex += div;
      }
      result.push([startIndex, length - 1]);
    } else {
      for (let i = 0; i < parallelCount; i++) {
        result.push([startIndex, startIndex + div - 1]);
        startIndex += div;
      }
    }
    return result;
  }

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
  flattenArray(arrayOfArrays) {
    let result = [];

    if (arrayOfArrays.length === 0) {
      return [];
    }

    if (ArrayBuffer.isView(arrayOfArrays[0])) {
      let length = 0;
      for (let i = 0; i < arrayOfArrays.length; i++) {
        length += arrayOfArrays[i].length;
      }
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
      typedArray.set(arrayOfArrays[0]);
      for (let i = 1; i < arrayOfArrays.length; i++) {
        typedArray.set(arrayOfArrays[i], arrayOfArrays[i - 1].length);
      }
      return typedArray;
    }

    for (let i = 0; i < arrayOfArrays.length; i++) {
      result = result.concat(arrayOfArrays[i]);
    }

    return result;
  }

  findMinimumIndex(results, partition) {
    let minimum = Number.MAX_VALUE;
    for (let i = 0; i < results.length; i++) {
      if (results[i] <= -1) {
        continue;
      }
      const index = results[i] + partition[i][0];
      if (index < minimum) {
        minimum = index;
      }
    }
    if (minimum === Number.MAX_VALUE) {
      return -1;
    }
    return minimum;
  }

  _fragmentOperation(array, partitionFunction, combinationFunction) {
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

  _indexOfFragment(subArray, searchElement, fromIndex = 0) {
    return subArray.indexOf(searchElement, fromIndex);
  }

  indexOf(array, searchElement, fromIndex = 0) {
    return this._fragmentOperation(array,
      (subArray, firstIndex) => {
        if (firstIndex < fromIndex) {
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
      (results, partition) => this.findMinimumIndex(results, partition)
    );
  }

  _everyFragment(subArray, callback, thisArg) {
    return subArray.every(callback, thisArg);
  }

  every(array, callback, thisArg = null) {
    return this._fragmentOperation(array,
      (subArray) => [
        this._everyFragment,
        subArray,
        callback,
        thisArg,
      ],
      (results) => {
        for (let i = 0; i < results.length; i++) {
          if (!results[i]) {
            return false;
          }
        }
        return true;
      }
    );
  }

  _someFragment(subArray, callback, thisArg) {
    return subArray.some(callback, thisArg);
  }

  some(array, callback, thisArg = null) {
    return this._fragmentOperation(array,
      (subArray) => [
        this._someFragment,
        subArray,
        callback,
        thisArg,
      ],
      (results) => {
        for (let i = 0; i < results.length; i++) {
          if (!results[i]) {
            return true;
          }
        }
        return false;
      }
    );
  }

  _filterFragment(subArray, callback, thisArg) {
    return subArray.filter(callback, thisArg);
  }

  filter(array, callback, thisArg = null) {
    return this._fragmentOperation(array,
      (subArray) => [
        this._filterFragment,
        subArray,
        callback,
        thisArg,
      ],
      (results) => this.flattenArray(results)
    );
  }

  _findFragment(subArray, callback, thisArg) {
    return subArray.find(callback, thisArg);
  }

  find(array, callback, thisArg = null) {
    return this._fragmentOperation(array,
      (subArray) => [
        this._findFragment,
        subArray,
        callback,
        thisArg,
      ],
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

  _findIndexFragment(subArray, callback, thisArg) {
    return subArray.findIndex(callback, thisArg);
  }

  findIndex(array, callback, thisArg = null) {
    return this._fragmentOperation(array,
      (subArray) => [
        this._findIndexFragment,
        subArray,
        callback,
        thisArg,
      ],
      (results, partition) => this.findMinimumIndex(results, partition)
    );
  }

  _mapFragment(subArray, callback, thisArg) {
    return subArray.map(callback, thisArg);
  }

  map(array, callback, thisArg = null) {
    return this._fragmentOperation(array,
      (subArray) => [
        this._mapFragment,
        subArray,
        callback,
        thisArg,
      ],
      (results) => this.flattenArray(results)
    );
  }

  _parallelizeAndCombineFragment(subArray, parallelizeOperation, callback,
    thisArg) {
    return parallelizeOperation(subArray, callback, thisArg);
  }

  parallelizeAndCombine(array, parallelizeOperation,
    combineOperation, callback, thisArg = null) {
    return this._fragmentOperation(array,
      (subArray) => [
        this._parallelizeAndCombineFragment,
        subArray,
        parallelizeOperation,
        callback,
        thisArg,
      ],
      (results, partition) => combineOperation(results, partition)
    );
  }

  /*
  return this.fragmentOperation(array,
      (subArray, firstIndex, lastIndex) => {},
      (results, partition) => {}
    );
  */
}
