/*
	logger.js
	allows to log message in the console tab of the current tab
*/

var parser = new window.DOMParser();

if (chrome.runtime.onMessage.getListenerCount() === 0) {
	chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
		var xml,
			data = JSON.parse(message);

		if (data.type == 'xml') {
			// log XML elements
			xml = parser.parseFromString(data.message, "text/xml");
			console.info(xml.children[0]);
		}
		else if (typeof console[data.type] == 'function') {
			// log a message
			console[data.type](data.message);
		}
	});
}