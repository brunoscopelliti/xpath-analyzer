
/**
 * S
 * usage: ...
 */
 
ChromeAppManager.define("messanger", [], function() {

  "use strict";

  return function send(message, type){
    chrome.tabs.getSelected(null, function (tab) {
      chrome.tabs.executeScript(null, {file: './logger.js'}, function () {
        chrome.tabs.sendMessage(tab.id, JSON.stringify({ message, type }));
      });
    });
  };

});
