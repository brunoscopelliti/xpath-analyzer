
ChromeAppManager.define("Model", [], function() {

  "use strict";

  const dataStore = new Map();
  const watchers = {};

  function Model(initialValues){
    for (let k in initialValues){
      if (initialValues.hasOwnProperty(k)){
        dataStore.set(k, initialValues[k]);
      }
    }
  }

  Model.prototype.get = function(key){
    return dataStore.get(key);
  };

  Model.prototype.set = function(key, value){
    var currentValue = dataStore.get(key);
    dataStore.set(key, value);
    if (watchers[key]){
      watchers[key].forEach(function(watchFn) {
        watchFn.call(this, key, currentValue, value);
      }, this);
    }
  };

  Model.prototype.watch = function(key, fn){
    if (!watchers.get(key)){
      watchers.set(key, []);
    }
    watchers.get(key).push(fn);
  };

  // @todo unwatch, watchOne

  Model.prototype.unwatch = function(key, fn){
    throw "to be implemented,";
  };

  Model.prototype.watchOne = function(key, fn){
    throw "to be implemented,";
  };


  return Model;

});
