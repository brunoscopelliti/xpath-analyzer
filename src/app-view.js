
ChromeAppManager.define('view', ['loopProps', 'filterProps'], function(loopProps, filterProps) {

  "use strict";

  function ViewConfigError(msg) {
    this.name = 'ViewConfigError';
    this.message = msg;
  }

  ViewConfigError.prototype = new Error();
  

  const defaults_ = {

    // a list of prop's watches which will be automatically set
    // duging the registration phase
    watches: [],

    // the name of the previous view    
    prev: null,
    
    // the name of the next view
    next: null,
    
    // define if the view can be accessed
    isEnabled: true,

    // define if the view is currently selected
    isSelected: false,
  
    // task which should be executed before 
    // the view is displayed
    setup: function() {},
    
    // task which should be executed before 
    // the view is hidden
    teardown: function() {}
  
  };

  var base_ = Object.create(defaults_, {

    select: {
      value: function(failFn) {
        return new Promise((res, rej) => {

          if (!this.isEnabled) {
            return rej({ status: 401 });
          }

          let currView = view(':selected');

          currView.teardown();
          this.setup();

          currView.isSelected = false;
          this.isSelected = true;

          res(this);

        });
      }
    },

    read: {
      value: function(key) {
        return this.data_[key];
      }
    },

    store: {
      value: function(key, value) {
        this.data_[key] = value;
      }
    }

  });

  var id = 0;
  var views_ = Object.create(null);

  function view(name){

    if (name == ':selected'){
      return filterProps(views_, view => view.isSelected)[0];
    }
    
    return views_[name];
  
  }

  view.register = function register(name, config) {

    // check the consistency of the parameters
    // name, and config.selector are mandatory information

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


    // create the view base data
    // and apply the configuration

    views_[name] = Object.create(base_);
    
    views_[name].name = name;
    views_[name].el = document.querySelector(config.selector);
    views_[name].guid_ = ++id;
    views_[name].data_ = {};

    for (var k in config){
      if (config.hasOwnProperty(k)){
        Object.defineProperty(views_[name], k, Object.getOwnPropertyDescriptor(config, k));
      }
    }


    // @todo register watches

    // when the view is registered as preselected
    // we've to run immediately its setup
    if (config.isSelected){
      views_[name].setup();
    }

    return views_[name];

  };

  view.reset = function reset(name){

    if (name){
      return delete views_[name];
    }
    return views_ = {};

  };

  return view;

});
