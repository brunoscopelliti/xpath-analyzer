
/**
 * A simple wrapper to handle xhr GET requests
 * usage: xhr(url).then(function() { .. }).catch(function() { .. })
 */
 
ChromeAppManager.define('xhr', [], function() {

  'use strict';

  return function xhr(url){

    return new Promise(function(res, rej) {

      var req = new XMLHttpRequest();

      req.onreadystatechange = function(evt) {
        if (req.readyState==4) {
          if (req.status==200){
            return res({ status: req.status, xml: req.responseXML });
          }
          return rej(req.status);
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
