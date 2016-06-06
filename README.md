parallelized-js
===============
A simple JavaScript library for parallel computations in the browser.

It uses [Web Workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers)
to create real threads to harness the power of modern multi-core CPUs and uses a fall-back,
if Web Workers are not properly supported.

You can run your functions in the background on a separate thread and retrieve the results
from Promises as soon as the computation has finished.
Arrays are especially sopported with parallelized versions of standard functions,
such as `map` and `filter` that automatically distribute the workload among several Workers.
You can easily define your own parellelized functions for arrays.

The main [limitation imposed by the Web Workers API](http://www.html5rocks.com/en/tutorials/workers/basics/#toc-enviornment) is the inability to have any side effects, like manipulating variables or the DOM.


Installation
------------

Install with bower:
```
bower <TODO>
```

Usage
-----
A full documentation of all classes and functions can be found [here](TODO).
####Simple example:
```javascript
const workers = new ParallelizedJS.WorkerManager({
  extendArray: true,
});

function plusOne(a) {
  return a + 1;
}

[1, 2, 3, 4].parallelMap(plusOne)
  .then((result) => {
    console.log(result);
  });
```

`extendArray: true` extends the `Array.prototype` (and also the prototypes for TypedArrays).
If you do not want this, you can use the array functions like this: 
```javascript
workers.parallelArray.map(
  [1, 2, 3, 4],
  plusOne)
  .then((result) => {
    console.log(result);
  });
```

####Parameters for the WorkerManager:

| Parameter | Default | Description |
|:---------:|:---------:|:---------:|
| extendArray | [false] | Extends the Array.prototype
| maxPoolCount | [4] | How many Workers should be created and maintained in the Worker pool.
| maxParallelCount | [4] | How many Workers can run concurrently.


####Parallelized array functions:
`indexOf, every, some, filter, find, findIndex, map`
If used over the Array.prototype, the parallelized functions start with 'parallel' and an uppercase character,
like `[].parallelIndexOf`.
The arguments are the same, as for the single threaded versions.
The return value is delivered in a Promise.

####Typed Arrays:
To avoid copying operations [TypedArrays](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers#Passing_data_by_transferring_ownership_(transferable_objects))
can be used:

```javascript
const array = Uint32Array(1000);
for (let i = 0; i < 1000; i++) {
  array[i] = i;
}
const workers = new ParallelizedJS.WorkerManager();
workers.parallelArray.filter(
  array,
  (element) => element % 2 == 0)
  .then((result) => {
    console.log(result);
  });
```

####Function invocation:
Custom functions can be invoked in a parallel thread with the `WorkerManager.invoke` method:
```javascript
function doSomething(a, b, c, d) {
  return a + b * c - d;
}
const workers = new ParallelizedJS.WorkerManager();

workers.invoke(doSomething, 1, 2, 3, 4)
  .then((result) => {
    console.log(result);
  });
```
The first parameter is the function followed by its arguments.

If you want to utilize the performance advantage of TypedArrays, you can use `WorkerManager.arrayInvoke`,
where the first argument of your custom function needs to accept such an array.

####Manage Worker contexts:
Workers have an isolated context. If you need other functions to call from within your own function, you must make them available to the worker.
The WorkerManager sets the respective values automatically for all WorkerThreads it manages. You can enable functions via `WorkerManager.setNamedFunctions`:
```javascript
function foo (a) {
  return a * 2;
}
function bar (a) {
  return a / 2;
}
function doSomething(a, b) {
  return foo(a) - bar(b);
}
const workers = new ParallelizedJS.WorkerManager();

workers.setNamedFunctions([foo, bar]);
workers.invoke(doSomething, 50, 40)
  .then((result) => {
    console.log(result);
  });
```

You can also directly import whole (external) scripts via ```WorkerManager.importScripts``` and an array of URLs.

####Without the WorkerManager:

You can create and manage individual `WorkerThread`s on your own in the same way, as you would with use the `WorkerManager`:
```javascript
const worker = new ParallelizedJS.WorkerFactory.createWorker();
worker.invoke(doSomething, 1, 2, 3, 4)
  .then((result) => {
    console.log(result);
  });
```



Limitations
-----------
Please note the [restrictions](http://www.html5rocks.com/en/tutorials/workers/basics/#toc-enviornment) of the Web Workers:
- no access to the DOM, window or document object
- no access to external functions, variables or scripts
- function parameters must be serializable (this class automatically serializes functions given as a parameter)
- all values are copied to the Worker context (not referenced), i.e. there might be a lot of overhead
 
The copying of values can be avoided by using a
[TypedArray](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers#Passing_data_by_transferring_ownership_(transferable_objects))
with `WorkerThread.arrayInvoke`

The Worker basically runs in a closed environment. With almost no access to the outside.
You can import external scripts using `WorkerThread.importScripts` or defined functions
using `WorkerThread.setFunctions` into the Worker context.

Build
------------

####Install dependencies
```
npm install
```

####Build
```
npm run build
```
or with file watcher:
```
npm run buildwatch
```

####Linting
```
npm run lint
```

####Documentation
```
npm run doc
```

####Unit Tests
Open `./test/testrunner.html` and `./test/testrunner_support.html` in your browser.
The later one performs the tests without actual Workers,
but with substitutions that make the library compatible with older browsers.

####Deploy Build
```
npm run builddeploy
```


License
------------
MIT License

Copyright (c) 2016 Alexander Ruppert

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.