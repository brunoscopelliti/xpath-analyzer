
/**
 * A simple wrapper to handle event delegation
 * usage: el.addEventListener("click", delegate(".elem", function(evt) { ... });
 */
 
ChromeAppManager.define("delegate", [], function() {

  "use strict";

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
