/**
 * Function that is used inside to Web Worker for coordination.
 * It communicates via messages and supports these message types:
 * - invoke: Invokes a function with given arguments
 * - arrayInvoke: Invokes a function on a number array (TypedArray)
 * - setFunctions: Sets functions to be used in the local context
 * - importScripts: Imports external scripts over a URL
 * @export
 */
export function workerFunction() {
  // needed for Babel (ES6 conversion)
  self._toArray = function (arr) {
    return Array.isArray(arr) ? arr : [].slice.call(arr);
  };

  // needed to avoid conflicts with later user defined functions
  self._helperFunctions = {
    functionCache: {}
  };

  // deserializes functions, uses cache if function with same id was already deserialized
  self._helperFunctions.getFunction = function (func, id) {
    if (id == 0) { // eslint-disable-line
      return eval(func);
    }

    if (!self._helperFunctions.functionCache.hasOwnProperty(id)) {
      self._helperFunctions.functionCache[id] = eval(func);
    }
    return self._helperFunctions.functionCache[id];
  };

  // deserializes function arguments. Detects serialized function strings with a prefix
  self._helperFunctions.flatDeserializeArguments = function (args) {
    const result = [];
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      if (typeof arg === 'string' && arg.indexOf('(function(){') ===
        0) {
        result.push(self._helperFunctions.getFunction(arg, 0));
      } else {
        result.push(arg);
      }
    }
    return result;
  };

  // ACTUAL WORK IS DONE HERE
  self.onmessage = (message) => {
    const {
      type,
      payload,
    } = message.data;

    // check for message type
    if (type === 'invoke') {
      payload.fn = self._helperFunctions.getFunction(payload.fn, payload.id);
      const deserializedArgs = self._helperFunctions.flatDeserializeArguments(
        payload.serializedArgs);
      // invoke function and return value as a message
      const result = payload.fn.apply(self, deserializedArgs);
      self.postMessage(result);
    } else if (type === 'arrayInvoke') {
      payload.fn = self._helperFunctions.getFunction(payload.fn, payload.id);
      const deserializedArgs = self._helperFunctions.flatDeserializeArguments(
        payload.serializedArgs);
      // invoke function and return value as a message
      const result = payload.fn.apply(self, [payload.array].concat(
        deserializedArgs));

      // use specialized API call, if return value is a TypedArray
      if (ArrayBuffer.isView(result)) {
        self.postMessage(result, [result.buffer]);
        return;
      }
      self.postMessage(result);
    } else if (type === 'setFunctions') {
      for (const key in payload) {
        if (payload.hasOwnProperty(key)) {
          self[key] = self._helperFunctions.getFunction(payload[key], 0);
        }
      }
    } else if (type === 'importScripts') {
      self.importScripts.apply(self, payload);
    }
  };
}
