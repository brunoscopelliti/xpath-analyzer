/*
 logger.js
 allows to log message in the console tab of the current tab
 */

var parser = new window.DOMParser();

if (!chrome.runtime.onMessage.hasListeners()) {
  chrome.runtime.onMessage.addListener(function (data, sender, sendResponse) {
    
    'use strict';

    var obj = JSON.parse(data);



    if (obj.type == 'info'){
      console.info(obj.message, 'font-weight: bold;');
    }
    else if (obj.type == 'xml') {
      // parse XML response
      let xml = parser.parseFromString(obj.message, "text/xml");
      console.log(xml.children[0]);
    }
    else if (typeof console[obj.type] == 'function'){
      console[obj.type](obj.message);
    }


    
  
  });
}