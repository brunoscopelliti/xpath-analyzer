
ChromeAppManager.define('Model', [], function() {

  'use strict';

  var id = -1;
  var one_ = Symbol('one');

  const modelStore = {};

  function Model(key, initialValues){

    if (key && modelStore[key]) {
      return modelStore[key];
    }

    this.guid_ = key || '_anon_' + ++id;
    this.dataStore = new Map();
    this.watchers = {};

    for (let k in initialValues){
      if (initialValues.hasOwnProperty(k)){
        this.dataStore.set(k, initialValues[k]);
      }
    }

    modelStore[key] = this;
  }


  Model.prototype.get = function(key){
    return this.dataStore.get(key);
  };

  Model.prototype.set = function(key, value){
    var currentValue = this.dataStore.get(key);
    this.dataStore.set(key, value);
    if (this.watchers[key]){
      let cancelled = false;
      let undo = () => { cancelled = true; this.dataStore.set(key, currentValue); };
      this.watchers[key].forEach(function(watchFn) {
        if (!cancelled){
          watchFn.call(this, key, currentValue, value, undo);
        }
      }, this);
    }
  };

  Model.prototype.watch = function(key, fn, opts){

    if (!this.watchers[key]){
      this.watchers[key] = [];
    }

    const oneshotFn = (...args) => {
      this.unwatch(key, oneshotFn);
      fn.apply(null, args);
    }

    const handler = opts && opts[one_] ? oneshotFn : fn;
    this.watchers[key].push(handler);
  };

  Model.prototype.unwatch = function(key, fn){
    if (typeof this.watchers[key] == 'undefined' || this.watchers[key].length == 0){
      return false;
    }
    if (fn == null){
      this.watchers[key] = [];
      return true;
    }
    var watcherIndex = this.watchers[key].indexOf(fn);
    if (watcherIndex < 0) {
      return false;
    }
    return this.watchers[key].splice(watcherIndex, 1).length == 1;
  };

  Model.prototype.watchOne = function(key, fn){
    this.watch(key, fn, { [one_]: true });
  };

  Model.prototype.destroy = function() {
    this.dataStore = this.watchers = null;
    return delete modelStore[this.guid_];
  };

  return Model;

});
