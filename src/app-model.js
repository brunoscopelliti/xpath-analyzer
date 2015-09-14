
ChromeAppManager.define("Model", [], function() {

  "use strict";

  var id = -1;
  var one_ = Symbol("one");

  const dataStore = [];
  const watchers = [];

  function Model(initialValues){
    this.guid_ = ++id;
    dataStore[this.guid_] = new Map();
    
    watchers[this.guid_] = {};
    for (let k in initialValues){
      if (initialValues.hasOwnProperty(k)){
        dataStore[this.guid_].set(k, initialValues[k]);
      }
    }
  }

  Model.getOrCreate = function(guid) {

  };

  Model.prototype.get = function(key){
    return dataStore[this.guid_].get(key);
  };

  Model.prototype.set = function(key, value){
    var currentValue = dataStore[this.guid_].get(key);
    dataStore[this.guid_].set(key, value);
    if (watchers[this.guid_][key]){
      let cancelled = false;
      let undo = () => { cancelled = true; dataStore[this.guid_].set(key, currentValue); };
      watchers[this.guid_][key].forEach(function(watchFn) {
        if (!cancelled){
          watchFn.call(this, key, currentValue, value, undo);
          if (watchFn[one_]){
            this.unwatch(key, watchFn);
          }
        }
      }, this);
    }
  };

  Model.prototype.watch = function(key, fn){
    if (!watchers[this.guid_][key]){
      watchers[this.guid_][key] = [];
    }
    watchers[this.guid_][key].push(fn);
  };

  Model.prototype.unwatch = function(key, fn){
    if (typeof watchers[this.guid_][key] == "undefined" || watchers[this.guid_][key].length == 0){
      return false;
    }
    if (fn == null){
      watchers[this.guid_][key] = [];
      return true;
    }
    var watcherIndex = watchers[this.guid_][key].indexOf(fn);
    if (watcherIndex < 0) {
      return false;
    }
    return watchers[this.guid_][key].splice(watcherIndex, 1).length == 1;
  };

  Model.prototype.watchOne = function(key, fn){
    fn[one_] = true;
    this.watch(key, fn);
  };

  return Model;

});
