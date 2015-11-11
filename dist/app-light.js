
var ChromeAppManager = (function() {

  'use strict';

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


/**
 * A simple helper function to check if an object is an XML document
 * usage: isXML(subject);
 */

ChromeAppManager.define('isXML', [], function() {

  'use strict';

  return function isXML(subject){
    var documentElement = (subject ? subject.ownerDocument || subject : 0).documentElement;
    return documentElement ? documentElement.nodeName !== 'HTML' : false;
  };

});

/**
 * Send a message with the result of the xpath evaluation
 * to the logger.js script that was injected into the page.
 */

ChromeAppManager.define('messanger', ['isXML'], function(isXML) {

  'use strict';

  var serializer = new XMLSerializer();

  return function send(message, type){
    chrome.tabs.getSelected(null, function (tab) {
      chrome.tabs.executeScript(null, {file: './logger.js'}, function () {
        if (type == 'xml'){
          if (isXML(message)){
            message = serializer.serializeToString(message);
          }
          else {
            type = 'table';
          }
        }
        chrome.tabs.sendMessage(tab.id, JSON.stringify({ message, type }));
      });
    });
  };

});


/**
 * A simple wrapper to handle event delegation
 * usage: el.addEventListener('click', delegate('.elem, function(evt) { ... });
 */
 
ChromeAppManager.define('delegate', [], function() {

  'use strict';

  function match_(target, selector, boundElement){
    if (target === boundElement){
      return false;
    }
    if (target.matches(selector)){
      return target;
    }
    if (target.parentNode){
      return match_(target.parentNode, selector, boundElement);
    }
    return false;
  }

  return function delegate(selector, fn){
    return function(evt) {
      var el;
      if(el = match_(evt.target, selector, this)){
        fn.call(el, evt);
      }
    };
  };

});


/**
 * A simple wrapper to handle xhr GET requests
 * usage: xhr(url).then(function() { .. }).catch(function() { .. })
 */

ChromeAppManager.define('xhr', ['isXML'], function(isXML) {

  'use strict';

  return function xhr(url){

    return new Promise(function(res, rej) {

      var req = new XMLHttpRequest();

      req.onreadystatechange = function(evt) {
        if (req.readyState==4) {
          if (req.status==200){
            if (req.responseXML && isXML(req.responseXML)){
              return res({ status: req.status, xml: req.responseXML });
            }
            return rej({ status: 400, message: 'Invalid XML' });
          }
          return rej({ status: req.status, message: req.statusText});
        }
      };

      req.onerror = function(evt){
        return rej(evt);
      };

      req.open('GET', url, true);
      req.send();

    });

  };

});


/**
 * A simple helper function to loop over the own properties of an object
 * usage: loopProps({ a:1, b: 2}, function() { ... });
 */

ChromeAppManager.define('loopProps', [], function() {

  'use strict';

  return function loopProps(targetObj, iterator, context){
    context = context || this;
    for (let k in targetObj){
      if (Object.prototype.hasOwnProperty.call(targetObj, k)){
        iterator.call(context, targetObj[k], k, targetObj);
      }
    }
  };

});

/**
 * A simple helper function to filter
 * usage: filter({ a:{ f: true }, b: { f: false } }, x => x.f)
 */

ChromeAppManager.define('filterProps', ['loopProps'], function(loopProps) {

  'use strict';

  return function filterProps(targetObj, predicate, context){
    var res = [];
    context = context || this;
    loopProps.call(null, targetObj, function(obj) {
      if (predicate.apply(this, arguments)) {
        res.push(obj);
      }
    }, context);
    return res;
  };

});

/**
 * Evaluates xpath expression against the given XML document
 */

ChromeAppManager.define('parser', [], function() {

  'use strict';


  function* resultGenerator(results){
    var node;
    do {
      node = results.iterateNext();
      yield node;
    } while(node);
  }

  
  function consumeIterator_(it){

    var result = [];
    var nodes = resultGenerator(it);

    let node = nodes.next().value;

    if (!node){
      return normalize_(result);
    }

    let ownerElement = node.ownerElement;

    if (node.nodeType == Element.ATTRIBUTE_NODE){

      let attrs_ = {};

      attrs_[node.name] = node.value;

      for (node of nodes){
        if (node){
          if (node.ownerElement != ownerElement){
            ownerElement = node.ownerElement;
            result.push(attrs_);
            attrs_ = {};
          }
          attrs_[node.name] = node.value;
        }
      }

      result.push(attrs_);

    }
    else {

      result.push(node.nodeType == Element.TEXT_NODE ? node.textContent : node);

      for (node of nodes){
        if (node){
          result.push(node.nodeType == Element.TEXT_NODE ? node.textContent : node);
        }
      }

    }

    return normalize_(result);

  }


  function normalize_(data){

    if (data.length == 0){
      return '';
    }

    if (data.length == 1){

      if (data[0].nodeType){
        return data[0];
      }
    
      let props = Object.getOwnPropertyNames(data[0]);
      return props.length == 1 ? data[0][props[0]] : data[0];
      
    }

    return data;

  }



  return function evaluate(xml, xpath){

    var res =  xml.evaluate(xpath, xml,  null, XPathResult.ANY_TYPE, null);

    switch (res.resultType) {
      
      case XPathResult.BOOLEAN_TYPE:
        return res.booleanValue;

      case XPathResult.NUMBER_TYPE:
        return res.numberValue;

      case XPathResult.STRING_TYPE:
        return res.stringValue;

      default:
        return consumeIterator_(res);
    }

  };

});

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
          if (watchFn[one_]){
            this.unwatch(key, watchFn);
          }
        }
      }, this);
    }
  };

  Model.prototype.watch = function(key, fn){
    if (!this.watchers[key]){
      this.watchers[key] = [];
    }
    this.watchers[key].push(fn);
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
    fn[one_] = true;
    this.watch(key, fn);
  };

  Model.prototype.destroy = function() {
    this.dataStore = this.watchers = null;
    return delete modelStore[this.guid_];
  };

  return Model;

});


ChromeAppManager.define('view', ['loopProps', 'filterProps'], function(loopProps, filterProps) {

  'use strict';

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

    loopProps(config, (val, k, original) => Object.defineProperty(views_[name], k, Object.getOwnPropertyDescriptor(original, k)));


    // register watches.
    // watches property is an array; first argument is the model, 
    // then all the others are objects with pais of property/handler.

    // if the property name starts with '?', the handler is fired only if
    // the view is currently selected.
    // handler should be the name of a method in the view context.

    if (views_[name].watches.length > 0){
      let model = views_[name].watches.shift();
      views_[name].watches.forEach(function(obj){
    
        var prop = Object.keys(obj)[0];
        var watcherName = obj[prop];

        var fn, handler = typeof watcherName == 'function' ? watcherName : this[watcherName];
        
        if (prop.startsWith('?')){
          prop = prop.replace('?', '');

          // @todo when rest parameters will be supported in Chrome, 
          // this should be refactored using an arrow function
          fn = function() { this.isSelected && handler.apply(this, arguments); }.bind(this);
        }
        else{
          fn = handler.bind(this);
        }

        model.watch(prop, fn);

      }, views_[name]);

    }


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
