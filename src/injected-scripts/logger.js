/*
 logger.js
 allows to log message in the console tab of the current tab
 */

var parser = new window.DOMParser();

if (!chrome.runtime.onMessage.hasListeners()) {
  chrome.runtime.onMessage.addListener(function (data, sender, sendResponse) {
    
    "use strict";


    console.log(data);
    


  });
}