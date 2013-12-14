/*
* xPath Analyzer
*
* @version 1.2
* @author Bruno Scopelliti ( http://brunoscopelliti.com )
*/

var CookieManager, DOMManager, xPathAnalyzer, keyupFn;

var logger = function(type, message) {
  // allows to log a message in the main console
  chrome.tabs.getSelected(null, function(tab) {
    chrome.tabs.executeScript(null, { file: "js/logger.js" }, function() {
      chrome.tabs.sendMessage(tab.id, JSON.stringify({"type": type, "message": message}));
    });
  });
}


CookieManager = (function() {
  // it exposes method to write/read cookies
  // it's based on jquery-cookies ( https://github.com/carhartl/jquery-cookie/blob/master/jquery.cookie.js )

  var getValue = function(s) {

    if (s.indexOf('"') === 0) {
      s = s.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
    }

    try {
      return JSON.parse(decodeURIComponent(s.replace(/\+/g, ' ')));
    } 
    catch(e) { }

  }

  return {
    
    // read the value stored in the "key" cookie
    read: function(key) {

      var parts, name, cookie,
        result = {},
        cookies = document.cookie ? document.cookie.split('; ') : [];

      for (var i = 0; i < cookies.length; i++) {

        parts = cookies[i].split('=');
        name = decodeURIComponent(parts.shift());
        cookie = parts.join('=');

        if (key && key === name) {
          result = getValue(cookie);
          break;
        }

        // prevent storing a cookie that we couldn't decode.
        if (!key && (cookie = getValue(cookie)) !== undefined) {
          result[name] = cookie;
        }

      }

      return result;

    },

    // write a cookie    
    write: function(key, value) {

      return (document.cookie = encodeURIComponent(key) + '=' + encodeURIComponent(JSON.stringify(value))  + '; expires=');
    
    }

  }

})();

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

  var _h = CookieManager.read('history');

  return {

    xml: null,

    history: (_h instanceof Array) ? _h : [],

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
            // if xPath (implicitly) expect a string as result (i.e. root/child/text() or /root/@attribute)

            // check if the expression match more than an element
            result = _self.xml.evaluate('count(' + xPath + ')', _self.xml, null, XPathResult.NUMBER_TYPE, null);

            if (result.numberValue > 1) {
              // xpath matches many elements
              if (tmp[tmp.length-1].indexOf('@') == 0) {
                // xpath matches one (or more) attributes
                tmp.pop();
                _self.getAllAttributes(tmp.join('/'));
              }
              else {
                // xpath match the element's text content
                tmp.pop();
                _self.getAllTextContent(tmp.join('/'));
              }
            }
            else {
              // xpath matches one element
              result = _self.xml.evaluate('string(' + xPath + ')', _self.xml, null, XPathResult.STRING_TYPE, null);
              DOMManager.showResult(true, result.stringValue);
            }

          }
          else {
            // if xPath match one (or more) XML element(s)
            _self.getAllElement();
          }
        break;
      }

    },

    // get all the elements which match the xPath
    getAllElement: function() {

      var currentNode,
        _self = this,
        serializer = new XMLSerializer(),
        iterator = _self.xml.evaluate(_self.lastQuery, _self.xml, null, XPathResult.UNORDERED_NODE_ITERATOR_TYPE, null);

      logger('info', 'Result(s) for ' + _self.lastQuery + ': ');

      try {
        currentNode = iterator.iterateNext();

        if (!currentNode) {
          // no results
          logger('warn', 'Not found.');
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

    },

    // get the value of the attribute(s) which match the xPath  
    getAllAttributes: function(xPath) {

      var currentNode, attr, 
        tmpObj = {},
        table = [],
        _self = this,
        iterator;

      if (_self.lastQuery.substr(0,3) == '//@') {
        // recovery consecutive slashes
        xPath = '/' + xPath + '*';
      }
      iterator = _self.xml.evaluate(xPath, _self.xml, null, XPathResult.UNORDERED_NODE_ITERATOR_TYPE, null);

      attr = _self.lastQuery.split('/@');
      attr = attr[attr.length-1];

      logger('info', 'Result(s) for ' + _self.lastQuery + ': ');

      try {
        currentNode = iterator.iterateNext();

        while (currentNode) {

          if (attr == '*') {
            // if xpath matches all the property of the current element
            tmpObj = {};
            currentNode = !currentNode.parentNode ? currentNode.children[0] : currentNode;
            for (var _a in currentNode.attributes){
              if (currentNode.attributes.hasOwnProperty(_a) && currentNode.hasAttribute(currentNode.attributes[_a].name)) {
                tmpObj[currentNode.attributes[_a].name] = currentNode.attributes[_a].value;
              }
            }
            table.push(tmpObj);
          }
          else {
            // if xpath match a specific property
            tmpObj = {};
            currentNode = !currentNode.parentNode ? currentNode.children[0] : currentNode;
            if (currentNode.hasAttribute(attr)) {
              tmpObj[attr] = currentNode.getAttribute(attr);
              table.push(tmpObj);
            }
          }

          currentNode = iterator.iterateNext();

        }

        // show results
        logger('table', table);
        DOMManager.showResult(false);

      }
      catch (e) {
        DOMManager.handleError(false, e);
      }

    },

    // get the text content of the elements which match the xPath
    getAllTextContent: function(xPath) {

      var currentNode,
        j = 1,
        _self = this,
        iterator = _self.xml.evaluate(xPath, _self.xml, null, XPathResult.UNORDERED_NODE_ITERATOR_TYPE, null);

      logger('info', 'Result(s) for ' + _self.lastQuery + ': ');

      try {
        currentNode = iterator.iterateNext();
        while (currentNode) {
          logger('info', j + ' - ' + currentNode.textContent);
          currentNode = iterator.iterateNext();
          j++;
        }
        // show results
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

  var historyMemoryLimit = 15,
    currentHistoryEntry = 0, 
    direction = 'prev',
    xpathInput = document.getElementById('xpath');


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
    
    switch (e.which) {
      
      case 13:
        // ENTER key 

        // add the xPath to the history
        xPathAnalyzer.history.unshift(this.value);
        if (xPathAnalyzer.history.length > historyMemoryLimit) {
          xPathAnalyzer.history.length = historyMemoryLimit;
        }
        CookieManager.write('history', xPathAnalyzer.history);

        // evaluate the xPath
        xPathAnalyzer.test(this.value);

        //
        currentHistoryEntry = 0;
        direction = 'prev';
        
        break;
      
      case 38:
        // ARROW UP key
        // fill the input with the previous xPath

        if (currentHistoryEntry < xPathAnalyzer.history.length) {

          if (direction == 'next') {
            currentHistoryEntry++;
            direction = 'prev';
          }

          xpathInput.value = xPathAnalyzer.history[currentHistoryEntry];
          currentHistoryEntry++;

        }

        break;

      case 40:
        // ARROW DOWN key
        // fill the input with the next xPath

        if (currentHistoryEntry > 0) {

          if (direction == 'prev') {
            currentHistoryEntry--;
            direction = 'next';
          }

          currentHistoryEntry--;
          xpathInput.value = xPathAnalyzer.history[currentHistoryEntry];

        }

        break;

    }

  };

  xpathInput.addEventListener('keyup', keyupFn, false);

}