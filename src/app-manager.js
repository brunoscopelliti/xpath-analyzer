
var ChromeAppManager = (function() {

  "use strict";

  var store_ = [];

  function define(name, deps, fn){
    
    store_[name] = fn.apply(fn, deps.map(m => store_[m]));
  
  }

  function require(deps, fn, context){

    context = context || null;
    return fn.apply(context, deps.map(m => store_[m]));

  }

  return {
    define: define,
    require: require
  };

}());
