var parser=new window.DOMParser;!chrome.runtime.onMessage.hasListeners()&&chrome.runtime.onMessage.addListener(function(a){var b,c=JSON.parse(a);"xml"==c.type?(b=parser.parseFromString(c.message,"text/xml"),console.info(b.children[0])):"function"==typeof console[c.type]&&console[c.type](c.message)});