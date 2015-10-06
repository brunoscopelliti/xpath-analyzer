
/**
 * A simple helper function to check if an object is an XML document
 * usage: isXML(subject);
 */

ChromeAppManager.define('isXML', [], function() {

  'use strict';

  return function isXML(subject){
    var documentElement = (subject ? subject.ownerDocument || subject : 0).documentElement;
    return documentElement ? documentElement.nodeName !== 'HTML' : false;
  };

});