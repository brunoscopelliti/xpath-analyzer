/*
	getPageContent.js
	if the current tab contains xml, returns the content
*/

var getXMLContent = function() {
	if (document.getElementById('webkit-xml-viewer-source-xml')) {
		// get the XML
		return document.getElementById('webkit-xml-viewer-source-xml').innerHTML;
	}
	else if (document.getElementById('tree')) {
		// get the XML when the XML Tree extension is installed 
		// to get XML Tree visit http://bit.ly/Rink5Y
		return document.getElementById('tree').textContent;
	}
}

chrome.extension.sendMessage({ action: "getSource", source: getXMLContent() });