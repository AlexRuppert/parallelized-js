export function workerFunction() {
  self._toArray = function (arr) { // eslint-disable-line
    return Array.isArray(arr) ? arr : [].slice.call(arr);
  };
  self._helperFunctions = {};
  self._helperFunctions.functionCache = {};

  self._helperFunctions.getFunction = function (func, id) { // eslint-disable-line
    if (id === 0) {
      return eval(func); // eslint-disable-line
    }

    if (!self._helperFunctions.functionCache.hasOwnProperty(id)) {
      self._helperFunctions.functionCache[id] = eval(func); // eslint-disable-line
    }
    return self._helperFunctions.functionCache[id];
  };

  self._helperFunctions.flatDeserializeArguments = function (args) { // eslint-disable-line
    const result = [];
    for (let i = 0; i < args.length; i++) {
      const argument = args[i];
      if (typeof argument === 'string' && argument.indexOf('(function(){') ===
        0) {
        result.push(self._helperFunctions.getFunction(argument, 0));
      } else {
        result.push(argument);
      }
    }
    return result;
  };

  self.onmessage = (message) => {
    const {
      type,
      payload,
    } = message.data;

    if (type === 'invoke') {
      let {
        fn,
        id, // eslint-disable-line
        serializedArgs, // eslint-disable-line
      } = payload;
      fn = self._helperFunctions.getFunction(fn, id);
      const deserializedArgs = self._helperFunctions.flatDeserializeArguments(
        serializedArgs);
      const result = fn.apply(self, deserializedArgs);
      self.postMessage(result);
    } else if (type === 'setFunctions') {
      for (const key in payload) {
        if (payload.hasOwnProperty(key)) {
          self[key] = self._helperFunctions.getFunction(payload[key], 0);
        }
      }
    } else if (type === 'importScripts') {
      self.importScripts.apply(self, payload);
    } else if (type === 'arrayInvoke') {
      let {
        fn,
        id, // eslint-disable-line
        array, // eslint-disable-line
        serializedArgs, // eslint-disable-line
      } = payload;

      fn = self._helperFunctions.getFunction(fn, id);
      const deserializedArgs = self._helperFunctions.flatDeserializeArguments(
        serializedArgs);

      const result = fn.apply(self, [array].concat(deserializedArgs));
      if (ArrayBuffer.isView(result)) {
        self.postMessage(result, [result.buffer]);
        return;
      } else if (Array.isArray(result) && result.length > 0 && typeof result[
          0] === 'number') {
        const bufferedArray = Float64Array.from(result);
        self.postMessage(bufferedArray, [bufferedArray.buffer]);
        return;
      }
      self.postMessage(result);
    }
  };
}
