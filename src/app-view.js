
ChromeAppManager.define('view', [], function() {

  "use strict";

  function ViewConfigError(msg) {
    this.name = 'ViewConfigError';
    this.message = msg;
  }

  ViewConfigError.prototype = new Error();
  

  const defaults_ = {
    
    prev: null,
    
    next: null,
    
    isEnabled: true,

    isSelected: false,
    
    setup: function() {},
    
    teardown: function() {}
  
  };

  var base_ = Object.create(defaults_, {

    select: {
      value: function() {
      }
    }

  });


  var views_ = Object.create(null);

  function view(name){
    
    return views_[name];
  
  }

  view.register = function register(name, config) {

    if (!name){
      throw new ViewConfigError('missing mandatory argument: name');
    }
    else if (views_[name]){
      return views_[name];
    }

    if (!config || !config.selector) {
      throw new ViewConfigError('missing mandatory configuration property: selector');
    }

    views_[name] = Object.create(base_);
    
    views_[name].name = name;
    views_[name].el = document.querySelector(config.selector);

    for (var k in config){
      if (config.hasOwnProperty(k)){
        Object.defineProperty(views_[name], k, Object.getOwnPropertyDescriptor(config, k));
      }
    }

    return views_[name];

  };

  view.reset = function(name){

    if (name){
      return delete views_[name];
    }
    return views_ = {};

  };

  return view;

});

