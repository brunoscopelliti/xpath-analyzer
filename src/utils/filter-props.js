
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