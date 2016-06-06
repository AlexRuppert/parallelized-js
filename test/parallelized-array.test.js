/*eslint-disable */
describe('ParallelizedArray Extension', () => {
  let manager;
  let parallelArray;
  before(() => {
    manager = new ParallelizedJS.WorkerManager({
      extendArray: true
    });
    parallelArray = manager.parallelArray;
  });
  it('should extend Array', () => {
    expect(Array.prototype.parallelIndexOf).to.be.truthy;
    expect(Array.prototype.parallelEvery).to.be.truthy;
    expect(Array.prototype.parallelSome).to.be.truthy;
    expect(Array.prototype.parallelFilter).to.be.truthy;
    expect(Array.prototype.parallelFind).to.be.truthy;
    expect(Array.prototype.parallelFindIndex).to.be.truthy;
    expect(Array.prototype.parallelMap).to.be.truthy;
    return expect([1, 2, 3].parallelIndexOf(2)).to.eventually.equal(1);
  });

  it('should extend Int8Array', () => {
    expect(Int8Array.prototype.parallelIndexOf).to.be.truthy;
    expect(Int8Array.prototype.parallelEvery).to.be.truthy;
    expect(Int8Array.prototype.parallelSome).to.be.truthy;
    expect(Int8Array.prototype.parallelFilter).to.be.truthy;
    expect(Int8Array.prototype.parallelFind).to.be.truthy;
    expect(Int8Array.prototype.parallelFindIndex).to.be.truthy;
    expect(Int8Array.prototype.parallelMap).to.be.truthy;

    const testArray = Int8Array.from([1, 2, 3]);
    return expect(testArray.parallelIndexOf(2)).to.eventually.equal(1);
  });

  it('should extend Uint8Array', () => {
    expect(Uint8Array.prototype.parallelIndexOf).to.be.truthy;
    expect(Uint8Array.prototype.parallelEvery).to.be.truthy;
    expect(Uint8Array.prototype.parallelSome).to.be.truthy;
    expect(Uint8Array.prototype.parallelFilter).to.be.truthy;
    expect(Uint8Array.prototype.parallelFind).to.be.truthy;
    expect(Uint8Array.prototype.parallelFindIndex).to.be.truthy;
    expect(Uint8Array.prototype.parallelMap).to.be.truthy;

    const testArray = Uint8Array.from([1, 2, 3]);
    return expect(testArray.parallelIndexOf(2)).to.eventually.equal(1);
  });

  it('should extend Int16Array', () => {
    expect(Int16Array.prototype.parallelIndexOf).to.be.truthy;
    expect(Int16Array.prototype.parallelEvery).to.be.truthy;
    expect(Int16Array.prototype.parallelSome).to.be.truthy;
    expect(Int16Array.prototype.parallelFilter).to.be.truthy;
    expect(Int16Array.prototype.parallelFind).to.be.truthy;
    expect(Int16Array.prototype.parallelFindIndex).to.be.truthy;
    expect(Int16Array.prototype.parallelMap).to.be.truthy;

    const testArray = Int16Array.from([1, 2, 3]);
    return expect(testArray.parallelIndexOf(2)).to.eventually.equal(1);
  });

  it('should extend Uint16Array', () => {
    expect(Uint16Array.prototype.parallelIndexOf).to.be.truthy;
    expect(Uint16Array.prototype.parallelEvery).to.be.truthy;
    expect(Uint16Array.prototype.parallelSome).to.be.truthy;
    expect(Uint16Array.prototype.parallelFilter).to.be.truthy;
    expect(Uint16Array.prototype.parallelFind).to.be.truthy;
    expect(Uint16Array.prototype.parallelFindIndex).to.be.truthy;
    expect(Uint16Array.prototype.parallelMap).to.be.truthy;

    const testArray = Uint16Array.from([1, 2, 3]);
    return expect(testArray.parallelIndexOf(2)).to.eventually.equal(1);
  });

  it('should extend Int32Array', () => {
    expect(Int32Array.prototype.parallelIndexOf).to.be.truthy;
    expect(Int32Array.prototype.parallelEvery).to.be.truthy;
    expect(Int32Array.prototype.parallelSome).to.be.truthy;
    expect(Int32Array.prototype.parallelFilter).to.be.truthy;
    expect(Int32Array.prototype.parallelFind).to.be.truthy;
    expect(Int32Array.prototype.parallelFindIndex).to.be.truthy;
    expect(Int32Array.prototype.parallelMap).to.be.truthy;

    const testArray = Int32Array.from([1, 2, 3]);
    return expect(testArray.parallelIndexOf(2)).to.eventually.equal(1);
  });

  it('should extend Uint32Array', () => {
    expect(Uint32Array.prototype.parallelIndexOf).to.be.truthy;
    expect(Uint32Array.prototype.parallelEvery).to.be.truthy;
    expect(Uint32Array.prototype.parallelSome).to.be.truthy;
    expect(Uint32Array.prototype.parallelFilter).to.be.truthy;
    expect(Uint32Array.prototype.parallelFind).to.be.truthy;
    expect(Uint32Array.prototype.parallelFindIndex).to.be.truthy;
    expect(Uint32Array.prototype.parallelMap).to.be.truthy;

    const testArray = Uint32Array.from([1, 2, 3]);
    return expect(testArray.parallelIndexOf(2)).to.eventually.equal(1);
  });

  it('should extend Float32Array', () => {
    expect(Float32Array.prototype.parallelIndexOf).to.be.truthy;
    expect(Float32Array.prototype.parallelEvery).to.be.truthy;
    expect(Float32Array.prototype.parallelSome).to.be.truthy;
    expect(Float32Array.prototype.parallelFilter).to.be.truthy;
    expect(Float32Array.prototype.parallelFind).to.be.truthy;
    expect(Float32Array.prototype.parallelFindIndex).to.be.truthy;
    expect(Float32Array.prototype.parallelMap).to.be.truthy;

    const testArray = Float32Array.from([1, 2, 3]);
    return expect(testArray.parallelIndexOf(2)).to.eventually.equal(1);
  });

  it('should extend Float64Array', () => {
    expect(Float64Array.prototype.parallelIndexOf).to.be.truthy;
    expect(Float64Array.prototype.parallelEvery).to.be.truthy;
    expect(Float64Array.prototype.parallelSome).to.be.truthy;
    expect(Float64Array.prototype.parallelFilter).to.be.truthy;
    expect(Float64Array.prototype.parallelFind).to.be.truthy;
    expect(Float64Array.prototype.parallelFindIndex).to.be.truthy;
    expect(Float64Array.prototype.parallelMap).to.be.truthy;

    const testArray = Float64Array.from([1, 2, 3]);
    return expect(testArray.parallelIndexOf(2)).to.eventually.equal(1);
  });
});
describe('ParallelizedArray Methods', () => {
  let manager;
  let parallelArray;
  before(() => {
    manager = new ParallelizedJS.WorkerManager({
      extendArray: true
    });
    parallelArray = manager.parallelArray;
  });

  it('should implement "indexOf"', () => {
    const result = [];
    const testArray = [
      0, 1, 2, 3, 4, 5, 0, 1, 2, 3, 4, 5
    ];

    result[0] = parallelArray.indexOf(testArray, 1);
    result[1] = parallelArray.indexOf(testArray, 6);
    result[2] = parallelArray.indexOf(testArray, 1, 2);
    return expect(Promise.all(result)).to.eventually.deep.equal(
      [1, -1, 7]);
  });
  it('should implement "every"', () => {
    const result = [];
    const testArray = [
      0, 1, 2, 3, 4, 5, 0, 1, 2, 3, 4, 5
    ];

    result[0] = parallelArray.every(testArray, (element) => element < 6);
    result[1] = parallelArray.every(testArray, (element) => element % 2 ==
      1);
    return expect(Promise.all(result)).to.eventually.deep.equal([true,
      false
    ]);
  });
  it('should implement "some"', () => {
    const result = [];
    const testArray = [
      0, 1, 2, 3, 4, 5, 0, 1, 2, 3, 4, 5
    ];

    result[0] = parallelArray.some(testArray, (element) => element ===
      2);
    result[1] = parallelArray.some(testArray, (element) => element > 5);
    return expect(Promise.all(result)).to.eventually.deep.equal([true,
      false
    ]);
  });
  it('should implement "filter"', () => {
    let result;
    const testArray = [
      0, 1, 2, 3, 4, 5, 0, 1, 2, 3, 4, 5
    ];

    result = parallelArray.filter(testArray, (element) => element %
      2 == 0);

    return expect(result).to.eventually.have.property('1').equal(2);
  });
  it('should implement "find"', () => {
    let result;
    const testArray = [
      0, 1, 2, 3, 4, 5, 0, 1, 2, 3, 4, 5
    ];

    result = parallelArray.find(testArray, (element) => element / 2 ==
      1);
    return expect(result).to.eventually.equal(2);
  });
  it('should implement "findIndex"', () => {
    let result;
    const testArray = [
      0, 1, 2, 3, 4, 5, 0, 1, 2, 3, 4, 5
    ];

    result = parallelArray.findIndex(testArray, (element) => element /
      2 == 1);
    return expect(result).to.eventually.equal(2);
  });
  it('should implement "map"', () => {
    let result;
    const testArray = [
      0, 1, 2, 3, 4, 5, 0, 1, 2, 3, 4, 5
    ];

    result = parallelArray.map(testArray, (element) => element - 1);
    return expect(result).to.eventually.have.property('1').equal(0);
  });
});
