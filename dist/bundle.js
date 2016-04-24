/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _workerManager = __webpack_require__(1);

	var _workerScript = __webpack_require__(3);

	var _workerThread = __webpack_require__(2);

	function mul(a, b) {
	  return a * b;
	}

	var workerManager = new _workerManager.WorkerManager({
	  extendArray: true
	});

	/* workerManager.parallelArray.findIndex([1, 2, 3, 4, 5, 6, 7, 8],
	    (val) => val === 5)
	  .then((result) => {
	    console.log(result);
	  });*/

	var worker = new Worker(_workerThread.WorkerThread.functionToUrl(_workerScript.workerFunction));

	worker.onmessage = function (message) {
	  //console.log(message.data);
	  console.log(Date.now() - start1);
	  console.log(message.data);
	};
	var start1;
	var testArray1 = [];
	for (var i = 0; i < 1000000; i++) {
	  testArray1.push(i);
	}
	//console.log(Int32Array.from(testArray1).buffer.byteLength);

	function addAll(array) {
	  for (var _i = 0; _i < array.length; _i++) {
	    array[_i] += 5;
	  }
	  return array;
	}
	var message = {
	  type: 'arrayInvoke',
	  payload: {
	    fn: _workerThread.WorkerThread.functionToString(addAll).fn,
	    id: 0,
	    array: Int32Array.from(testArray1),
	    serializedArgs: []
	  }
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

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.WorkerManager = undefined;

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _workerThread = __webpack_require__(2);

	var _parallelizedArray = __webpack_require__(4);

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var WorkerManager = exports.WorkerManager = function () {
	  function WorkerManager() {
	    var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

	    _classCallCheck(this, WorkerManager);

	    this._options = {
	      maxParallelCount: 4,
	      maxPoolCount: 8,
	      extendArray: false
	    };

	    for (var key in options) {
	      if (options.hasOwnProperty(key)) {
	        this._options[key] = options[key];
	      }
	    }
	    this._pool = [];
	    this._queue = [];
	    for (var i = 0; i < this._options.maxPoolCount; i++) {
	      this._pool.push(new _workerThread.WorkerThread(i, this.threadFinished.bind(this)));
	    }
	    this._parallelArray = new _parallelizedArray.ParallelizedArray(this, this._options.extendArray);
	  }

	  _createClass(WorkerManager, [{
	    key: 'threadFinished',
	    value: function threadFinished(id) {
	      if (this._queue.length > 0) {
	        var resolve = this._queue.shift();
	        resolve(this._pool[id]);
	      }
	    }
	  }, {
	    key: 'getNextFreeWorkerThread',
	    value: function getNextFreeWorkerThread() {
	      var self = this;
	      return new Promise(function (resolve) {
	        var found = false;
	        for (var i = 0; i < self._pool.length; i++) {
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
	  }, {
	    key: 'setFunctions',
	    value: function setFunctions(functionDictionary) {
	      for (var i = 0; i < this._pool.length; i++) {
	        this._pool[i].setFunctions(functionDictionary);
	      }
	    }
	  }, {
	    key: 'importScripts',
	    value: function importScripts(urls) {
	      for (var i = 0; i < this._pool.length; i++) {
	        this._pool[i].importScripts(urls);
	      }
	    }
	  }, {
	    key: 'setNamedFunctions',
	    value: function setNamedFunctions(functionArray) {
	      var functionDictionary = {};
	      if (typeof functionArray === 'function') {
	        functionArray = [functionArray]; // eslint-disable-line
	      }
	      for (var i = 0; i < functionArray.length; i++) {
	        var element = functionArray[i];
	        if (typeof element === 'function' && element.name) {
	          functionDictionary[element.name] = element;
	        }
	      }
	      this.setFunctions(functionDictionary);
	    }
	  }, {
	    key: 'invoke',
	    value: function invoke(func) {
	      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
	        args[_key - 1] = arguments[_key];
	      }

	      var self = this;
	      return new Promise(function (resolve) {
	        self.getNextFreeWorkerThread().then(function (workerThread) {
	          workerThread.invoke.apply(workerThread, [func].concat(args)).then(function (result) {
	            resolve(result);
	          });
	        });
	      });
	    }
	  }, {
	    key: 'parallelArray',
	    get: function get() {
	      return this._parallelArray;
	    }
	  }, {
	    key: 'maxParallelCount',
	    get: function get() {
	      return this._options.maxParallelCount;
	    }
	  }]);

	  return WorkerManager;
	}();

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.WorkerThread = undefined;

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _workerScript = __webpack_require__(3);

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var WorkerThread = exports.WorkerThread = function () {
	  function WorkerThread() {
	    var _this = this;

	    var id = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
	    var finishCallback = arguments.length <= 1 || arguments[1] === undefined ? function () {} : arguments[1];

	    _classCallCheck(this, WorkerThread);

	    this._worker = new Worker(WorkerThread.functionToUrl(_workerScript.workerFunction));

	    this._worker.onmessage = function (message) {
	      _this._isRunning = false;
	      //this._finishCallback(this._id);
	      _this._resolve(message.data);
	    };

	    this._id = id;
	    this._isRunning = false;
	    this._resolve = Promise.resolve;
	    this._finishCallback = finishCallback;
	  }

	  _createClass(WorkerThread, [{
	    key: 'setRunning',
	    value: function setRunning() {
	      this._isRunning = true;
	    }
	  }, {
	    key: 'setFunctions',
	    value: function setFunctions(functionDictionary) {
	      var serializedFunctionDictionary = {};
	      for (var key in functionDictionary) {
	        if (functionDictionary.hasOwnProperty(key)) {
	          var element = functionDictionary[key];
	          serializedFunctionDictionary[key] = WorkerThread.functionToString(element, false).fn;
	        }
	      }

	      this._worker.postMessage({
	        type: 'setFunctions',
	        payload: serializedFunctionDictionary
	      });
	    }
	  }, {
	    key: 'importScripts',
	    value: function importScripts(urls) {
	      this._worker.postMessage({
	        type: 'importScripts',
	        payload: urls
	      });
	    }
	  }, {
	    key: 'invoke',
	    value: function invoke(func) {
	      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
	        args[_key - 1] = arguments[_key];
	      }

	      var self = this;
	      self._isRunning = true;
	      return new Promise(function (resolve) {
	        var _WorkerThread$functio = WorkerThread.functionToString(func, true);

	        var fn = _WorkerThread$functio.fn;
	        var id = _WorkerThread$functio.id;


	        var serializedArgs = WorkerThread.flatSerializeArguments(args);
	        self._worker.postMessage({
	          type: 'invoke',
	          payload: {
	            fn: fn,
	            id: id,
	            serializedArgs: serializedArgs
	          }
	        });
	        self._resolve = resolve;
	      });
	    }
	  }, {
	    key: 'id',
	    get: function get() {
	      return this._id;
	    }
	  }, {
	    key: 'isRunning',
	    get: function get() {
	      return this._isRunning;
	    }
	  }], [{
	    key: 'generateId',
	    value: function generateId() {
	      function s4() {
	        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
	      }
	      return s4() + s4() + s4();
	    }
	  }, {
	    key: 'functionToUrl',
	    value: function functionToUrl(func) {
	      return URL.createObjectURL(new Blob(['(', func.toString(), ')()'], {
	        type: 'application/javascript'
	      }));
	    }
	  }, {
	    key: 'functionToString',
	    value: function functionToString(func) {
	      var cache = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

	      if (typeof func !== 'function') {
	        throw new Error('Passed argument is not a function!');
	      }

	      if (func.name) {
	        if (WorkerThread.functionCache.hasOwnProperty(func.name)) {
	          var cachedFunc = WorkerThread.functionCache[func.name];
	          return {
	            fn: cachedFunc.fn,
	            id: cachedFunc.id
	          };
	        }
	      }

	      var fn = '(function(){ return ' + func.toString() + ' })()';
	      var id = 0;
	      if (cache && func.name) {
	        id = WorkerThread.generateId();
	        WorkerThread.functionCache[func.name] = {
	          fn: fn,
	          id: id
	        };
	      }
	      return {
	        fn: fn,
	        id: id
	      };
	    }
	  }, {
	    key: 'flatSerializeArguments',
	    value: function flatSerializeArguments(args) {
	      var result = [];
	      for (var i = 0; i < args.length; i++) {
	        if (typeof args[i] === 'function') {
	          result.push(WorkerThread.functionToString(args[i], false).fn);
	        } else {
	          result.push(args[i]);
	        }
	      }
	      return result;
	    }
	  }]);

	  return WorkerThread;
	}();

	WorkerThread.functionCache = {};

/***/ },
/* 3 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.workerFunction = workerFunction;
	function workerFunction() {
	  self._toArray = function (arr) {
	    // eslint-disable-line
	    return Array.isArray(arr) ? arr : [].slice.call(arr);
	  };
	  self._helperFunctions = {};
	  self._helperFunctions.functionCache = {};

	  self._helperFunctions.getFunction = function (func, id) {
	    // eslint-disable-line
	    if (id === 0) {
	      return eval(func); // eslint-disable-line
	    }

	    if (!self._helperFunctions.functionCache.hasOwnProperty(id)) {
	      self._helperFunctions.functionCache[id] = eval(func); // eslint-disable-line
	    }
	    return self._helperFunctions.functionCache[id];
	  };

	  self._helperFunctions.flatDeserializeArguments = function (args) {
	    // eslint-disable-line
	    var result = [];
	    for (var i = 0; i < args.length; i++) {
	      var argument = args[i];
	      if (typeof argument === 'string' && argument.indexOf('(function(){') === 0) {
	        result.push(self._helperFunctions.getFunction(argument, 0));
	      } else {
	        result.push(argument);
	      }
	    }
	    return result;
	  };

	  self.onmessage = function (message) {
	    var _message$data = message.data;
	    var type = _message$data.type;
	    var payload = _message$data.payload;


	    if (type === 'invoke') {
	      var fn = // eslint-disable-line
	      payload.fn;
	      var id = payload.id;
	      var // eslint-disable-line
	      serializedArgs = payload.serializedArgs;

	      fn = self._helperFunctions.getFunction(fn, id);
	      var deserializedArgs = self._helperFunctions.flatDeserializeArguments(serializedArgs);
	      var result = fn.apply(self, deserializedArgs);
	      self.postMessage(result);
	    } else if (type === 'setFunctions') {
	      for (var key in payload) {
	        if (payload.hasOwnProperty(key)) {
	          self[key] = self._helperFunctions.getFunction(payload[key], 0);
	        }
	      }
	    } else if (type === 'importScripts') {
	      self.importScripts.apply(self, payload);
	    } else if (type === 'arrayInvoke') {
	      var _fn = // eslint-disable-line
	      payload.fn;
	      var _id = payload.id;
	      var // eslint-disable-line
	      array = payload.array;
	      var // eslint-disable-line
	      _serializedArgs = payload.serializedArgs;


	      _fn = self._helperFunctions.getFunction(_fn, _id);
	      var _deserializedArgs = self._helperFunctions.flatDeserializeArguments(_serializedArgs);

	      var _result = _fn.apply(self, [array].concat(_deserializedArgs));
	      if (ArrayBuffer.isView(_result)) {
	        self.postMessage(_result, [_result.buffer]);
	        return;
	      } else if (Array.isArray(_result) && _result.length > 0 && typeof _result[0] === 'number') {
	        var bufferedArray = Float64Array.from(_result);
	        self.postMessage(bufferedArray, [bufferedArray.buffer]);
	        return;
	      }
	      self.postMessage(_result);
	    }
	  };
	}

/***/ },
/* 4 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var ParallelizedArray = exports.ParallelizedArray = function () {
	  function ParallelizedArray(workerManager, extendArray) {
	    var _this = this;

	    _classCallCheck(this, ParallelizedArray);

	    this._workerManager = workerManager;

	    if (extendArray) {
	      (function () {
	        var self = _this;

	        Array.prototype.parallelIndexOf = function (searchElement) {
	          var fromIndex = arguments.length <= 1 || arguments[1] === undefined ? // eslint-disable-line
	          0 : arguments[1];

	          return self.indexOf(this, searchElement, fromIndex);
	        };
	        Array.prototype.parallelEvery = function (callback) {
	          var thisArg = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];
	          // eslint-disable-line
	          return self.every(this, callback, thisArg);
	        };
	        Array.prototype.parallelSome = function (callback) {
	          var thisArg = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];
	          // eslint-disable-line
	          return self.some(this, callback, thisArg);
	        };
	        Array.prototype.parallelFilter = function (callback) {
	          var thisArg = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];
	          // eslint-disable-line
	          return self.filter(this, callback, thisArg);
	        };
	        Array.prototype.parallelFind = function (callback) {
	          var thisArg = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];
	          // eslint-disable-line
	          return self.find(this, callback, thisArg);
	        };
	        Array.prototype.parallelFindIndex = function (callback) {
	          var thisArg = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];
	          // eslint-disable-line
	          return self.findIndex(this, callback, thisArg);
	        };
	        Array.prototype.parallelMap = function (callback) {
	          var thisArg = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];
	          // eslint-disable-line
	          return self.map(this, callback, thisArg);
	        };
	      })();
	    }
	  }

	  _createClass(ParallelizedArray, [{
	    key: '_partitionArrayIndexes',
	    value: function _partitionArrayIndexes(length) {
	      var parallelCount = this._workerManager.maxParallelCount;
	      var mod = length % parallelCount;
	      var div = Math.floor(length / parallelCount);
	      var result = [];

	      var startIndex = 0;
	      if (mod !== 0) {
	        div++;
	        for (var i = 0; i < parallelCount - 1; i++) {
	          result.push([startIndex, startIndex + div - 1]);
	          startIndex += div;
	        }
	        result.push([startIndex, length - 1]);
	      } else {
	        for (var _i = 0; _i < parallelCount; _i++) {
	          result.push([startIndex, startIndex + div - 1]);
	          startIndex += div;
	        }
	      }
	      return result;
	    }
	  }, {
	    key: '_createThread',
	    value: function _createThread(args) {
	      if (args !== null) {
	        return this._workerManager.invoke.apply(this._workerManager, args);
	      }
	      return null;
	    }
	  }, {
	    key: 'flattenArray',
	    value: function flattenArray(arrayOfArrays) {
	      var result = [];
	      for (var i = 0; i < arrayOfArrays.length; i++) {
	        result = result.concat(arrayOfArrays[i]);
	      }
	      return result;
	    }
	  }, {
	    key: 'findMinimumIndex',
	    value: function findMinimumIndex(results, partition) {
	      var minimum = Number.MAX_VALUE;
	      for (var i = 0; i < results.length; i++) {
	        if (results[i] <= -1) {
	          continue;
	        }
	        var index = results[i] + partition[i][0];
	        if (index < minimum) {
	          minimum = index;
	        }
	      }
	      if (minimum === Number.MAX_VALUE) {
	        return -1;
	      }
	      return minimum;
	    }
	  }, {
	    key: '_fragmentOperation',
	    value: function _fragmentOperation(array, partitionFunction, combinationFunction) {
	      var _this2 = this;

	      var self = this;
	      return new Promise(function (resolve) {
	        var partition = self._partitionArrayIndexes(array.length);
	        var threads = [];
	        partition.forEach(function (part) {
	          var subArray = array.slice(part[0], part[1] + 1);
	          var thread = _this2._createThread(partitionFunction(subArray, part[0], part[1]));
	          if (thread) {
	            threads.push(thread);
	          }
	        });

	        Promise.all(threads).then(function (results) {
	          resolve(combinationFunction(results, partition));
	        });
	      });
	    }
	  }, {
	    key: '_indexOfFragment',
	    value: function _indexOfFragment(subArray, searchElement) {
	      var fromIndex = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];

	      return subArray.indexOf(searchElement, fromIndex);
	    }
	  }, {
	    key: 'indexOf',
	    value: function indexOf(array, searchElement) {
	      var _this3 = this;

	      var fromIndex = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];

	      return this._fragmentOperation(array, function (subArray, firstIndex) {
	        if (firstIndex < fromIndex) {
	          return null;
	        }
	        var fromIndexAdjusted = Math.max(fromIndex - firstIndex, 0);
	        return [_this3._indexOfFragment, subArray, searchElement, fromIndexAdjusted];
	      }, function (results, partition) {
	        return _this3.findMinimumIndex(results, partition);
	      });
	    }
	  }, {
	    key: '_everyFragment',
	    value: function _everyFragment(subArray, callback, thisArg) {
	      return subArray.every(callback, thisArg);
	    }
	  }, {
	    key: 'every',
	    value: function every(array, callback) {
	      var _this4 = this;

	      var thisArg = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

	      return this._fragmentOperation(array, function (subArray) {
	        return [_this4._everyFragment, subArray, callback, thisArg];
	      }, function (results) {
	        for (var i = 0; i < results.length; i++) {
	          if (!results[i]) {
	            return false;
	          }
	        }
	        return true;
	      });
	    }
	  }, {
	    key: '_someFragment',
	    value: function _someFragment(subArray, callback, thisArg) {
	      return subArray.some(callback, thisArg);
	    }
	  }, {
	    key: 'some',
	    value: function some(array, callback) {
	      var _this5 = this;

	      var thisArg = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

	      return this._fragmentOperation(array, function (subArray) {
	        return [_this5._someFragment, subArray, callback, thisArg];
	      }, function (results) {
	        for (var i = 0; i < results.length; i++) {
	          if (!results[i]) {
	            return true;
	          }
	        }
	        return false;
	      });
	    }
	  }, {
	    key: '_filterFragment',
	    value: function _filterFragment(subArray, callback, thisArg) {
	      return subArray.filter(callback, thisArg);
	    }
	  }, {
	    key: 'filter',
	    value: function filter(array, callback) {
	      var _this6 = this;

	      var thisArg = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

	      return this._fragmentOperation(array, function (subArray) {
	        return [_this6._filterFragment, subArray, callback, thisArg];
	      }, function (results) {
	        return _this6.flattenArray(results);
	      });
	    }
	  }, {
	    key: '_findFragment',
	    value: function _findFragment(subArray, callback, thisArg) {
	      return subArray.find(callback, thisArg);
	    }
	  }, {
	    key: 'find',
	    value: function find(array, callback) {
	      var _this7 = this;

	      var thisArg = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

	      return this._fragmentOperation(array, function (subArray) {
	        return [_this7._findFragment, subArray, callback, thisArg];
	      }, function (results) {
	        for (var i = 0; i < results.length; i++) {
	          var result = results[i];
	          if (typeof result !== 'undefined') {
	            return result;
	          }
	        }
	        return undefined;
	      });
	    }
	  }, {
	    key: '_findIndexFragment',
	    value: function _findIndexFragment(subArray, callback, thisArg) {
	      return subArray.findIndex(callback, thisArg);
	    }
	  }, {
	    key: 'findIndex',
	    value: function findIndex(array, callback) {
	      var _this8 = this;

	      var thisArg = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

	      return this._fragmentOperation(array, function (subArray) {
	        return [_this8._findIndexFragment, subArray, callback, thisArg];
	      }, function (results, partition) {
	        return _this8.findMinimumIndex(results, partition);
	      });
	    }
	  }, {
	    key: '_mapFragment',
	    value: function _mapFragment(subArray, callback, thisArg) {
	      return subArray.map(callback, thisArg);
	    }
	  }, {
	    key: 'map',
	    value: function map(array, callback) {
	      var _this9 = this;

	      var thisArg = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

	      return this._fragmentOperation(array, function (subArray) {
	        return [_this9._mapFragment, subArray, callback, thisArg];
	      }, function (results) {
	        return _this9.flattenArray(results);
	      });
	    }
	  }, {
	    key: '_parallelizeAndCombineFragment',
	    value: function _parallelizeAndCombineFragment(subArray, parallelizeOperation, callback, thisArg) {
	      return parallelizeOperation(subArray, callback, thisArg);
	    }
	  }, {
	    key: 'parallelizeAndCombine',
	    value: function parallelizeAndCombine(array, parallelizeOperation, combineOperation, callback) {
	      var _this10 = this;

	      var thisArg = arguments.length <= 4 || arguments[4] === undefined ? null : arguments[4];

	      return this._fragmentOperation(array, function (subArray) {
	        return [_this10._parallelizeAndCombineFragment, subArray, parallelizeOperation, callback, thisArg];
	      }, function (results, partition) {
	        return combineOperation(results, partition);
	      });
	    }

	    /*
	    return this.fragmentOperation(array,
	        (subArray, firstIndex, lastIndex) => {},
	        (results, partition) => {}
	      );
	    */

	  }]);

	  return ParallelizedArray;
	}();

/***/ }
/******/ ]);