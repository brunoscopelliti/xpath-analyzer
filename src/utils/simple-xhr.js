
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
