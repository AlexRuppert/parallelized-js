/*eslint-disable */
describe('ParallelizedJS.WorkerThread', () => {
  it('should correclty report, if it is running', () => {
    const thread = ParallelizedJS.WorkerFactory.createWorker();

    expect(thread.isRunning).to.be.false;
    thread.invoke(() => {
      var now = new Date().getTime();
      while (new Date().getTime() < now + 10) { /* do nothing */ }
    });
    expect(thread.isRunning).to.be.true;
  });

  it('should serialize a function into a URL', () => {
    function test(a, b, c) {
      console.log(a, b, c);
    }

    const result = ParallelizedJS.WorkerThread.functionToUrl(test);
    expect(result).to.have.string('blob:null');
  });

  it('should serialize a function into a String', () => {
    function test(a, b, c) {
      console.log(a, b, c);
    }

    const result = ParallelizedJS.WorkerThread.functionToString(test);

    expect(result.fn).to.equal(
      '(function(){ return function test(a, b, c) {\n      console.log(a, b, c);\n    } })()'
    );
  });

  it('should serialize arguments', () => {
    function test(a, b, c) {
      console.log(a, b, c);
    }
    const args = [
      'hi',
      2,
      test
    ]
    const result = ParallelizedJS.WorkerThread.flatSerializeArguments(args);
    expect(result).to.deep.equal(['hi', 2,
      '(function(){ return function test(a, b, c) {\n      console.log(a, b, c);\n    } })()'
    ]);
  });

  it('should inject functions into the worker context', () => {
    function add(a, b) {
      return a + b;
    }

    function mul(a, b) {
      return a * b;
    }

    const thread = ParallelizedJS.WorkerFactory.createWorker();
    thread.setFunctions({
      add: add,
      mul: mul
    });
    const result = thread.invoke(() => {
      return mul(add(10, 5), 2);
    })

    return expect(result).to.eventually.equal(30);
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
    const thread = ParallelizedJS.WorkerFactory.createWorker();

    thread.importScripts([
      test
    ]);

    const result = thread.invoke(() => {
      return mul(add(10, 5), 2);
    });
    return expect(result).to.eventually.equal(30);
  });

  it('should invoke functions', () => {
    const thread = ParallelizedJS.WorkerFactory.createWorker();
    const result = thread.invoke(() => {
      return 12 * 12;
    });
    return expect(result).to.eventually.equal(144);
  });

  it('should invoke functions on arrays', () => {
    const testArray = Int32Array.from([
      0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11
    ]);
    const thread = ParallelizedJS.WorkerFactory.createWorker();
    const result = thread.arrayInvoke((array) => {
      let sum = 0;
      for (let i = 0; i < array.length; i++) {
        sum+=array[i];
      }
      return sum;
    }, testArray);
    
    return expect(result).to.eventually.equal(66);
  });
});
