var getXMLContent=function(){return document.getElementById("webkit-xml-viewer-source-xml")?document.getElementById("webkit-xml-viewer-source-xml").innerHTML:document.getElementById("tree")?document.getElementById("tree").textContent:void 0};chrome.extension.sendMessage({action:"getSource",source:getXMLContent()});