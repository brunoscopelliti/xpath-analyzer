
var tape = require('tape');
var sinon = require('sinon');

/**
 * module app-manager.js
 */

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


/**
 * module model.js
 */

tape('module model.js:', function(t) { t.end(); });

tape('interface', function(t) { 

  ChromeAppManager.require(['Model'], function(Model) {
    t.equal(typeof Model, 'function', 'model is a constructor function');
    t.equal(typeof Model.prototype.get, 'function', 'model has a "get" method');
    t.equal(typeof Model.prototype.set, 'function', 'model has a "set" method');
    t.equal(typeof Model.prototype.watch, 'function', 'model has a "watch" method');
    t.equal(typeof Model.prototype.unwatch, 'function', 'model has an "unwatch" method');
    t.equal(typeof Model.prototype.watchOne, 'function', 'model has a "watchOne" method');
    t.equal(typeof Model.prototype.destroy, 'function', 'model has a "destroy" method');
  });

  t.end();

});

tape('create/destroy new model', function(t) { 

  ChromeAppManager.require(['Model'], function(Model) {
    var appModel = new Model('test', { val: 42 });
    t.equal(appModel.get('val'), 42, 'model is created with the initial properties passed to the constructor');
    appModel.destroy('test');
    appModel = new Model('test');
    t.equal(appModel.get('val'), undefined, 'model was destroied');
    appModel.destroy('test');
  });

  t.end();

});

tape('get created model', function(t) { 

  ChromeAppManager.require(['Model'], function(Model) {
    var appModel = new Model('test', { val: 42 });
    t.equal(appModel.get('val'), 42, 'model is created with the initial properties passed to the constructor');
  });

  ChromeAppManager.require(['Model'], function(Model) {
    var appModel = new Model('test');
    t.equal(appModel.get('val'), 42, 'model is retrived');
    appModel.destroy('test');
  });

  t.end();

});

tape('get created model when more there are more different models', function(t) { 

  ChromeAppManager.require(['Model'], function(Model) {
    var appModel = new Model('app', { enabled: true });
    var siteModel = new Model('site', { val: 42 });
  });

  ChromeAppManager.require(['Model'], function(Model) {
    var appModel = new Model('app');
    var siteModel = new Model('site');
    
    t.equal(appModel.get('enabled'), true, 'the correct model is retrived');
    t.equal(siteModel.get('val'), 42, 'the correct model is retrived');
    
    appModel.destroy('app');
    siteModel.destroy('site');
  });

  t.end();

});

tape('set model properties', function(t) { 

  ChromeAppManager.require(['Model'], function(Model) {
    var appModel = new Model('test', { val: 42 });
    appModel.set('val', 1);
    t.equal(appModel.get('val'), 1, 'Model#set update the value of the property');
    appModel.set('arr', [1,2,3]);
    t.equal(appModel.get('arr').length, 3, 'Model#set set the value of a property to an array');
    appModel.set('obj', {val: true});
    t.equal(appModel.get('obj').val, true, 'Model#set update the value of a property to an object');

    appModel.destroy('test');
  });

  t.end();

});

tape('watch model property', function(t) { 

  ChromeAppManager.require(['Model'], function(Model) {
    var spy = sinon.spy();
    var appModel = new Model('test', { val: 42 });

    appModel.watch('val', spy);
    appModel.set('val', 1);

    t.ok(spy.calledOnce, 'watch set an handler that is executed when the watched property changes');
    
    var call = spy.getCall(0);
    t.equal(call.args[0], 'val', 'first argument is the property name');
    t.equal(call.args[1], 42, 'second argument is the property initial value');
    t.equal(call.args[2], 1, 'third argument is the property new value');
    t.equal(typeof(call.args[3]), 'function', 'fourth argument is a function that allows to revert the action');

    appModel.destroy('test');
  });

  t.end();

});

tape('watch model property, undo', function(t) { 

  ChromeAppManager.require(['Model'], function(Model) {
    var spy = sinon.spy();
    var appModel = new Model('test', { val: 42 });

    appModel.watch('val', function(key, old, current, undo) { return undo(); });
    appModel.watch('val', spy);
    appModel.set('val', 1);

    t.equal(appModel.get('val'), 42 , 'property has its initial value');
    t.ok(!spy.called, 'watchers after the undo action are not executed');

    appModel.destroy('test');
  });

  t.end();

});

tape('unwatch model property', function(t) { 

  ChromeAppManager.require(['Model'], function(Model) {
    var spy = sinon.spy();
    var appModel = new Model('test', { val: 42 });

    appModel.watch('val', spy);
    appModel.set('val', 1);

    t.ok(spy.calledOnce, 'watch set an handler that is executed when the watched property changes');
    
    spy.reset();

    var res = appModel.unwatch('val', spy);
    appModel.set('val', 10);

    t.ok(appModel.get('val') == 10 && res && !spy.called, 'unwatch deleted the handler, that isn\'t executed anymore');

    appModel.destroy('test');
  });

  ChromeAppManager.require(['Model'], function(Model) {
    var spy1 = sinon.spy();
    var spy2 = sinon.spy();
    var appModel = new Model('test', { enabled: true });

    appModel.watch('enabled', spy1);
    appModel.watch('enabled', spy2);
    
    var res = appModel.unwatch('enabled');
    appModel.set('enabled', false);

    t.ok(res && !spy1.called && !spy2.called, 'unwatch deleted all the watcher handlers of a specific model property');

    appModel.destroy('test');
  });

  t.end();

});

tape('watchOne model property', function(t) { 

  ChromeAppManager.require(['Model'], function(Model) {
    var spy = sinon.spy();
    var appModel = new Model('test', { val: 42 });

    appModel.watchOne('val', spy);
    appModel.set('val', 1);
    appModel.set('val', 2);

    t.ok(spy.calledOnce, 'watchOne set an handler that is executed only one time');

    appModel.destroy('test');
  });

  t.end();

});

  });

  t.end();

});