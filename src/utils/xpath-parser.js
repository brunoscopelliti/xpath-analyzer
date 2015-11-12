
/**
 * Evaluates xpath expression against the given XML document
 */

ChromeAppManager.define('parser', [], function() {

  'use strict';


  function* resultGenerator(results){
    var node;
    do {
      node = results.iterateNext();
      yield node;
    } while(node);
  }


  function consumeIterator_(it){

    var result = [];
    var nodes = resultGenerator(it);

    let node = nodes.next().value;

    if (!node){
      return normalize_(result);
    }

    let ownerElement = node.ownerElement;

    if (node.nodeType == Element.ATTRIBUTE_NODE){

      let attrs_ = {};

      attrs_[node.name] = node.value;

      for (node of nodes){
        if (node){
          if (node.ownerElement != ownerElement){
            ownerElement = node.ownerElement;
            result.push(attrs_);
            attrs_ = {};
          }
          attrs_[node.name] = node.value;
        }
      }

      result.push(attrs_);

    }
    else {

      result.push(node.nodeType == Element.TEXT_NODE ? node.textContent : node);

      for (node of nodes){
        if (node){
          result.push(node.nodeType == Element.TEXT_NODE ? node.textContent : node);
        }
      }

    }

    return normalize_(result);

  }


  function normalize_(data){

    if (data.length == 0){
      return '';
    }

    if (data.length == 1){

      if (data[0].nodeType){
        return data[0];
      }

      let props = Object.getOwnPropertyNames(data[0]);
      return props.length == 1 ? data[0][props[0]] : data[0];

    }

    return data;

  }



  return function evaluate(xml, xpath){

    var res =  xml.evaluate(xpath, xml,  null, XPathResult.ANY_TYPE, null);

    switch (res.resultType) {

      case XPathResult.BOOLEAN_TYPE:
        return res.booleanValue;

      case XPathResult.NUMBER_TYPE:
        return res.numberValue;

      case XPathResult.STRING_TYPE:
        return res.stringValue;

      default:
        return consumeIterator_(res);
    }

  };

});
