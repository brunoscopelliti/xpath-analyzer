/*
* xPath Analyzer
*
* @version 1.0
* @author Bruno Scopelliti (http://brunoscopelliti.com)
*/

var DOMManager, xPathAnalyzer, keyupFn;

var logger = function(type, message) {
  // allows to log a message in the main console
  chrome.tabs.getSelected(null, function(tab) {
    chrome.tabs.executeScript(null, { file: "js/logger.js" }, function() {
      chrome.tabs.sendMessage(tab.id, JSON.stringify({"type": type, "message": message}));
    });
  });
}

DOMManager = (function() {
  // it exposes methods to show results of the analysis

  // DOM shortcuts
  var _inputSection = document.getElementById('xpath-input'),
    _outputSection = document.getElementById('xpath-output'),
    _lastQuery = document.querySelector('#result-box .last-query'),
    _result = document.querySelector('#result-box .last-query-result'),
    _errorSection = document.getElementById('error-alert'),
    _errorMessage = document.querySelector('#error-alert .trace');

  return {

    // display error
    handleError: function(hideInput, errorMessage) {
      _errorMessage.innerText = errorMessage; 
      if (hideInput) {
        // in case of blocker error, hide input field, and remove keyup event listener
        _inputSection.className = 'hidden';
        document.getElementById('xpath').removeEventListener('keyup', keyupFn, false);
      }
      _outputSection.className = 'hidden';
      _errorSection.className = '';
      logger('error', errorMessage);
    },

    // display result
    showResult: function(isEvaluable, val) {
      _lastQuery.innerText = xPathAnalyzer.lastQuery;
      _result.innerHTML = isEvaluable ? '> ' + val : 'Check the <b>Console</b> tab of your <em>Chrome Dev Tools</em>.';
      _errorSection.className = 'hidden';
      _outputSection.className = '';
    }

  }

})();

xPathAnalyzer = (function() {
  // it exposes methods to execute the xPath analysis

  return {

    xml: null,

    lastQuery: null,

    // test the xPath
    test: function(xPath) {
      
      var tmp, result = {}, 
        _self = this;

      try {
        _self.lastQuery = xPath;
        result = _self.xml.evaluate(xPath, _self.xml, null, XPathResult.ANY_TYPE, null);
      }
      catch (e) {
        DOMManager.handleError(false, e.message);
      }

      switch (result.resultType) {
        case 1:
          // NUMBER_TYPE
          DOMManager.showResult(true, result.numberValue);
        break;
        case 2:
          // STRING_TYPE
          DOMManager.showResult(true, result.stringValue);
        break;
        case 3:
          // BOOLEAN_TYPE
          DOMManager.showResult(true, result.booleanValue);
        break;
        case 4:
          tmp = _self.lastQuery.split('/');
          if (tmp[tmp.length-1] == 'text()' || tmp[tmp.length-1].indexOf('@') == 0) {
            // in case xPath (implicitly) match a string (i.e. root/child/text() or /root/@attribute)
            result = _self.xml.evaluate('string(' + xPath + ')', _self.xml, null, XPathResult.ANY_TYPE, null);
            DOMManager.showResult(true, result.stringValue);
          }
          else {
            // in case the xPath match one (or more) XML element(s)
            _self.getAll();  
          }
        break;
      }

    },

    // get all the elements which match the xPath
    getAll: function() {

      var currentNode,
        _self = this,
        serializer = new XMLSerializer(),
        iterator = _self.xml.evaluate(_self.lastQuery, _self.xml, null, XPathResult.UNORDERED_NODE_ITERATOR_TYPE, null);

      logger('info', 'Result(s) for ' + _self.lastQuery + ': ');

      try {
        currentNode = iterator.iterateNext();

        if (!currentNode) {
          // no results
          logger('info', 'Not found.');
        }
        while (currentNode) {
          // log current result
          logger('xml', serializer.serializeToString(currentNode));
          currentNode = iterator.iterateNext();
        }
        DOMManager.showResult(false);
      }
      catch (e) {
        DOMManager.handleError(false, e);
      }

    }

  }

})()

// startup operations
window.onload = function() {

  // run an external script to get the content of the current page
  chrome.tabs.executeScript(null, { file: "js/getPageContent.js" }, function() {
    if (chrome.extension.lastError) {
      DOMManager.handleError(true, chrome.extension.lastError.message);
    }
  });

  // register a callback function that will be executed when a message is sent 
  // from either an extension process or a content script
  chrome.extension.onMessage.addListener(function(request, sender) {
    var parser;
    if (request.action == "getSource") {
      try {
        if (typeof request.source == 'undefined') {
          throw 'This page does not contain an XML document.';
        }
        parser = new DOMParser();
        xPathAnalyzer.xml = parser.parseFromString(request.source, "text/xml");
      }
      catch(e) {
        DOMManager.handleError(true, e);
      }
    }
  });

  // register the keyup event listener on the xpath input field
  keyupFn = function(e) {
    e.which == 13 && xPathAnalyzer.test(this.value);
  };
  document.getElementById('xpath').addEventListener('keyup', keyupFn, false);

}