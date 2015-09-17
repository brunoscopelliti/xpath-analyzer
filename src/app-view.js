
ChromeAppManager.define('view', ['loopProps'], function(loopProps) {

  "use strict";

  function ViewAccessError(msg) {
    this.name = 'ViewAccessError';
    this.message = msg;
  }

  function ViewConfigError(msg) {
    this.name = 'ViewConfigError';
    this.message = msg;
  }

  ViewConfigError.prototype = new Error();
  ViewAccessError.prototype = new Error();
  

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
      value: function(failFn) {
        try {
          if (!this.isEnabled) {
            throw new ViewAccessError(`${this.name} is currently disabled`);
          }
          loopProps(views_, function teardown_(view) {
            if (view.isSelected) {
              view.teardown();
              view.isSelected = false;
            }
          });
          this.setup();
          this.isSelected = true;
        }
        catch(err){
          failFn();
        }
        return this;
      }
    }

  });


  var views_ = {};

  function view(name){

    if (name == ':selected'){
      // @todo
      // throw "to be implemented";
    }
    
    return views_[name];
  
  }

  view.register = function register(name, config) {

    if (!name){
      throw new ViewConfigError('missing mandatory argument: name');
    }
    else if (/:/.test(name)){
      throw new ViewConfigError('view name cannot contain ":"');
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