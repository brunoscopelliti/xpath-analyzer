
var tape = require('tape');
var sinon = require('sinon');

tape('module app-manager.js:', function(t) { t.end(); });

tape('manager interface', function(t) {

  t.equal(typeof ChromeAppManager.define, 'function', 'app-manager has a "define" method');
  t.equal(typeof ChromeAppManager.require, 'function', 'app-manager has a "require" method');

  t.end();

});

tape('define/require methods', function(t) {

  ChromeAppManager.define('it', [], function() { return { id_: 'it', greeting: 'Ciao' }; });

  ChromeAppManager.define('en', [], function() { return { id_: 'en', greeting: 'Hi' }; });

  ChromeAppManager.define('localizator', ['en', 'it'], function(en, it) {
    const locales_ = Array.from(arguments);
    return function(key, locale) {
      const selectedLocale = locales_.filter(l => l.id_ == locale)[0] || en;
      return selectedLocale[key] || '';
    };
  });

  ChromeAppManager.require(['localizator'], function(localizator) {
    var greeting = localizator('greeting', 'it');
    t.equal(greeting, 'Ciao', 'define/require methods are working properly');
  });

  t.end();

});

tape('module model.js:', function(t) { t.end(); });

tape('interface', function(t) { 

  ChromeAppManager.require(['Model'], function(Model) {
    t.equal(typeof Model, 'function', 'model is a constructor function');
    t.equal(typeof Model.prototype.get, 'function', 'model has a "get" method');
    t.equal(typeof Model.prototype.set, 'function', 'model has a "set" method');
    t.equal(typeof Model.prototype.watch, 'function', 'model has a "watch" method');
    t.equal(typeof Model.prototype.unwatch, 'function', 'model has an "unwatch" method');
    t.equal(typeof Model.prototype.watchOne, 'function', 'model has a "watchOne" method');
  });

  t.end();

});