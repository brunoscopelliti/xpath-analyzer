
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
