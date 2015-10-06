
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