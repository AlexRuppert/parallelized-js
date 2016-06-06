/*eslint-disable */
describe('ParallelizedJS.WorkerManager', () => {
  it('should run multiple threads concurrently', () => {
    function add(a, b) {
      return a + b;
    }
    const manager = new ParallelizedJS.WorkerManager({
      maxParallelCount: 2,
      maxPoolCount: 2
    });
    const results = [];
    results.push(manager.invoke(add, 1, 2));
    results.push(manager.invoke(add, 2, 3));
    results.push(manager.invoke(add, 3, 4));
    results.push(manager.invoke(add, 4, 5));
    results.push(manager.invoke(add, 5, 6));
    results.push(manager.invoke(add, 6, 7));
    results.push(manager.invoke(add, 7, 8));
    results.push(manager.invoke(add, 8, 9));
    results.push(manager.invoke(add, 9, 10));

    return expect(Promise.all(results)).to.eventually.deep.equal(
      [3, 5, 7, 9, 11, 13, 15, 17, 19]);
  });

  it('should should inject functions into the worker context', () => {
    function add(a, b) {
      return a + b;
    }

    function mul(a, b) {
      return a * b;
    }
    const manager = new ParallelizedJS.WorkerManager({
      maxParallelCount: 2,
      maxPoolCount: 2
    });

    manager.setFunctions({
      add: add,
      mul: mul
    });

    function muladd(a, b, c) {
      return mul(add(a, b), c);
    }
    const results = [];
    results.push(manager.invoke(muladd, 1, 2, 3));
    results.push(manager.invoke(muladd, 1, 2, 3));
    results.push(manager.invoke(muladd, 1, 4, 3));
    results.push(manager.invoke(muladd, 1, 2, 3));
    results.push(manager.invoke(muladd, 1, 2, 3));

    return expect(Promise.all(results)).to.eventually.deep.equal(
      [9, 9, 15, 9, 9]);
  });

  it('should import scripts into the worker context', () => {
    function add(a, b) {
      return a + b;
    }

    function mul(a, b) {
      return a * b;
    }
    const test =
      'data:text/javascript;base64,KGZ1bmN0aW9uKCl7DQp3aW5kb3cubXVsID0gZnVuY3Rpb24oYSwgYikge3JldHVybiBhKmI7fTsNCndpbmRvdy5hZGQ9IGZ1bmN0aW9uKGEsIGIpIHtyZXR1cm4gYStiO307DQp9KCkpOw==';

    const manager = new ParallelizedJS.WorkerManager({
      maxParallelCount: 2,
      maxPoolCount: 2
    });

    manager.importScripts([
      test
    ]);

    function muladd(a, b, c) {
      return mul(add(a, b), c);
    }
    const results = [];
    results.push(manager.invoke(muladd, 1, 2, 3));
    results.push(manager.invoke(muladd, 1, 2, 3));
    results.push(manager.invoke(muladd, 1, 4, 3));
    results.push(manager.invoke(muladd, 1, 2, 3));
    results.push(manager.invoke(muladd, 1, 2, 3));

    return expect(Promise.all(results)).to.eventually.deep.equal(
      [9, 9, 15, 9, 9]);
  });

  it('should inject named functions into the worker context', () => {
    function add(a, b) {
      return a + b;
    }

    function mul(a, b) {
      return a * b;
    }
    const manager = new ParallelizedJS.WorkerManager({
      maxParallelCount: 2,
      maxPoolCount: 2
    });

    manager.setNamedFunctions([mul, add]);

    function muladd(a, b, c) {
      return mul(add(a, b), c);
    }
    const results = [];
    results.push(manager.invoke(muladd, 1, 2, 3));
    results.push(manager.invoke(muladd, 1, 2, 3));
    results.push(manager.invoke(muladd, 1, 4, 3));
    results.push(manager.invoke(muladd, 1, 2, 3));
    results.push(manager.invoke(muladd, 1, 2, 3));

    return expect(Promise.all(results)).to.eventually.deep.equal(
      [9, 9, 15, 9, 9]);
  });

  it('should work on multiple arrays concurrently', () => {
    const testArray = Int32Array.from([
      0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11
    ]);

    const manager = new ParallelizedJS.WorkerManager({
      maxParallelCount: 2,
      maxPoolCount: 2
    });

    function sumArray(array) {
      let sum = 0;
      for (let i = 0; i < array.length; i++) {
        sum += array[i];
      }
      return sum;
    }

    const results = [];
    results.push(manager.arrayInvoke(sumArray, [1, 2, 3]));
    results.push(manager.arrayInvoke(sumArray, [3, 4, 5]));
    results.push(manager.arrayInvoke(sumArray, [5, 6, 7]));
    results.push(manager.arrayInvoke(sumArray, [7, 8, 9]));
    results.push(manager.arrayInvoke(sumArray, [9, 10, 11]));
    results.push(manager.arrayInvoke(sumArray, [11, 12, 13]));
    results.push(manager.arrayInvoke(sumArray, [13, 14, 15]));
    results.push(manager.arrayInvoke(sumArray, [15, 16, 17]));
    results.push(manager.arrayInvoke(sumArray, [17, 18, 19]));

    return expect(Promise.all(results)).to.eventually.deep.equal(
      [6, 12, 18, 24, 30, 36, 42, 48, 54]);
  });
});
