export class ParallelizedArray {
  constructor(workerManager, extendArray) {
    this._workerManager = workerManager;

    if (extendArray) {
      const self = this;

      Array.prototype.parallelIndexOf = function (searchElement, fromIndex = // eslint-disable-line
        0) {
        return self.indexOf(this, searchElement, fromIndex);
      };
      Array.prototype.parallelEvery = function (callback, thisArg = null) { // eslint-disable-line
        return self.every(this, callback, thisArg);
      };
      Array.prototype.parallelSome = function (callback, thisArg = null) { // eslint-disable-line
        return self.some(this, callback, thisArg);
      };
      Array.prototype.parallelFilter = function (callback, thisArg = null) { // eslint-disable-line
        return self.filter(this, callback, thisArg);
      };
      Array.prototype.parallelFind = function (callback, thisArg = null) { // eslint-disable-line
        return self.find(this, callback, thisArg);
      };
      Array.prototype.parallelFindIndex = function (callback, thisArg = null) { // eslint-disable-line
        return self.findIndex(this, callback, thisArg);
      };
      Array.prototype.parallelMap = function (callback, thisArg = null) { // eslint-disable-line
        return self.map(this, callback, thisArg);
      };
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
      return this._workerManager.invoke.apply(this._workerManager, args);
    }
    return null;
  }
  flattenArray(arrayOfArrays) {
    let result = [];
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
    return new Promise((resolve) => {
      const partition = self._partitionArrayIndexes(array.length);
      const threads = [];
      partition.forEach((part) => {
        const subArray = array.slice(part[0], part[1] + 1);
        const thread = this._createThread(partitionFunction(subArray,
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
