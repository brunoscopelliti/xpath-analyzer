
"use strict";

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

tape('require with context', function(t) {

  var context = { factor: 2 };

  ChromeAppManager.define('number', [], function() {
    return 21;
  });

  ChromeAppManager.require(['number'], function(val) {
    t.equal(val*context.factor, 42, 'require accepts a context on which execute the function');
  }, context);

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


/**
 * module app-view.js
 */

tape('module app-view.js:', function(t) { t.end(); });

tape('interface', function(t) { 

  ChromeAppManager.require(['view'], function(view) {
    t.equal(typeof view, 'function', 'view is a function');
    t.equal(typeof view.register, 'function', 'view is a function');
    t.equal(typeof view.reset, 'function', 'view is a function');
  });

  t.end();

});

tape('register a new view', function(t) { 

  ChromeAppManager.require(['view'], function(view) {

    setup_('<div id="main">Hello world!</div>');

    var fakeModel = { val: 42 };
    
    var homeView = view.register('home', { 
      selector: '#main', 
      get isEnabled() {
        return fakeModel.val === 42;
      }
    });

    t.ok(homeView.isEnabled, 'view is enabled');
    t.equal(homeView.el.innerText, 'Hello world!', 'view root el is computed');

    t.equal(homeView.isSelected, false, 'view default "isSelected" is set');
    t.equal(homeView.next, null, 'view default "next" is set');
    t.equal(homeView.prev, null, 'view default "prev" is set');
    t.equal(typeof homeView.setup, 'function', 'view default "setup" is set');
    t.equal(typeof homeView.teardown, 'function', 'view default "teardown" is set');

    fakeModel.val++;
    t.ok(!homeView.isEnabled, 'view is disabled');

    var res = view.reset('home');
    t.ok(res && typeof view('home') == 'undefined', 'view does not exist anymore');

  });

  teardown_();

  t.end();

});

tape('store/read private view data', function(t) { 

  ChromeAppManager.require(['view'], function(view) {

    setup_('<div id="main">Hello world!</div>');

    var homeView = view.register('home', { 
      selector: '#main'
    });

    var otherView = view.register('other', { 
      selector: '#other'
    });

    homeView.store('tmpValue', 42);
    t.equal(homeView.read('tmpValue'), 42, 'view does not exist anymore');
    t.equal(otherView.read('tmpValue'), undefined, 'view does not exist anymore');

    view.reset();

  });

  teardown_();

  t.end();

});

tape('register a view throw a ViewConfigError', function(t) { 

  ChromeAppManager.require(['view'], function(view) {
    var badFn = view.register.bind(view, 'home');
    t.throws(badFn, /ViewConfigError/, 'throws a ViewConfigError exception');
  });

  t.end();

});

tape('select enabled view', function(t) { 

  ChromeAppManager.require(['view'], function(view) {

    setupView_.apply(view);

    var home = view('home');
    var login = view('login');
    var cart = view('cart');

    var spy = sinon.spy();
    var homeTeardownSpy = sinon.spy(home, 'teardown');
    var cartTeardownSpy = sinon.spy(cart, 'teardown');
    var loginSetupSpy = sinon.spy(login, 'setup');

    login.select().then(spy).then(function() {
      t.ok(spy.calledOnce, '(if defined) then execute other steps');

      view.reset();
      t.end();
    });

    t.ok(homeTeardownSpy.calledOnce && !cartTeardownSpy.called, 'first execute teardown for the selected view');
    t.ok(loginSetupSpy.calledOnce, 'then execute setup of the new selected view');
    t.ok(!home.isSelected && login.isSelected, 'the view was selected');

  });

});

tape('select not enabled view', function(t) { 

  ChromeAppManager.require(['view'], function(view) {

    setupView_.apply(view);

    var home = view('home');
    var login = view('login');
    var cart = view('cart');

    var spy = sinon.spy();
    var homeTeardownSpy = sinon.spy(home, 'teardown');
    var loginTeardownSpy = sinon.spy(login, 'teardown');
    var cartSetupSpy = sinon.spy(cart, 'setup');

    cart.select().catch(spy).then(function() {
      t.ok(spy.called, 'rejection is captured');
      t.ok(spy.getCall(0).args[0], 401, 'error code is 401');

      view.reset();
      t.end();
    });

    t.ok(!homeTeardownSpy.called && !loginTeardownSpy.called && !cartSetupSpy.called, 'teardown, and setup are not executed at all');
    t.ok(home.isSelected && !cart.isSelected, 'selected view didn\'t change');

  });

});

tape('view(:selected) returns the selected view', function(t) { 

  ChromeAppManager.require(['view'], function(view) {

    setupView_.apply(view);

    var home = view('home');
    var login = view('login');
    var cart = view('cart');
    var selectedView = view(':selected');    

    t.equal(selectedView, home, ':selected returns the selected view');

    view.reset();

  });

  t.end();

});


function setupView_(){

  setup_('\
    <div id="home">\
      <h1>Welcome</h1>\
      <button id="home-btn">Enter</button>\
    </div>\
    <div id="login">\
      <h1>Login</h1>\
      <input name="user" />\
      <button id="home-btn">Log in</button>\
    </div>\
    <div id="cart">\
      <h1>Shopping bag</h1>\
      <p>You have <b id="count"></b> products in your shopping bag. <span id="buy">Nuy now.</span>.</p>\
    </div>');

  var home = this.register('home', {
    selector: '#home',
    isSelected: true,
    next: 'login'
  });

  var login = this.register('login', {
    selector: '#login',
    prev: 'home',
    next: 'cart'
  });

  var cart = this.register('cart', {
    selector: '#cart',
    prev: 'login',
    get isEnabled() { return false; }
  });

}


/**
 * module utils/simple-delegation.js
 */

tape('module delegate.js:', function(t) { t.end(); });

tape('interface', function(t) { 

  ChromeAppManager.require(['delegate'], function(delegate) {
    t.equal(typeof delegate, 'function', 'delegate is a function');
  });

  t.end();

});

tape('delegate (target == delegator)', function(t) { 

  ChromeAppManager.require(['delegate'], function(delegate) {
    
    setup_('<div id="box"><button id="btn">Click here</button></div>');

    var spy = sinon.spy();
    box.addEventListener('click', delegate('#btn', spy));
    btn.click();

    t.ok(spy.calledOnce, 'event handler is called once');
    t.ok(spy.getCall(0).calledOn(btn), 'event handler is called on the correct context "this"');
    t.ok(spy.getCall(0).args[0] instanceof Event, 'event handler receives the dom event object as first argument');

  });

  teardown_();

  t.end();

});

tape('delegate (target is inside delegator)', function(t) { 

  ChromeAppManager.require(['delegate'], function(delegate) {
    
    setup_('<div id="box"><button id="btn"><span id="text">Click here</span></button></div>');

    var spy = sinon.spy();
    box.addEventListener('click', delegate('#btn', spy));
    text.click();

    t.ok(spy.calledOnce, 'event handler is called once');
    t.ok(spy.getCall(0).calledOn(btn), 'event handler is called on the correct context "this"');
    t.ok(spy.getCall(0).args[0] instanceof Event, 'event handler receives the dom event object as first argument');

  });

  teardown_();

  t.end();

});


/**
 * module utils/loop-props.js
 */

tape('module loop-props.js:', function(t) { t.end(); });

tape('interface', function(t) { 

  ChromeAppManager.require(['loopProps'], function(loopProps) {
    t.equal(typeof loopProps, 'function', 'loopProps is a function');
  });

  t.end();

});

tape('simple loop', function(t) { 

  ChromeAppManager.require(['loopProps'], function(loopProps) {

    var base_ = { z: 100 };
    var obj = Object.create(base_);

    obj.a = 1;
    obj.b = 2;

    var spy = sinon.spy();

    loopProps(obj, spy);

    t.ok(spy.calledTwice, 'iterator is called once for each own property');

    var call1 = spy.getCall(0);
    t.equal(call1.args[0], 1, 'first argument is the property value');
    t.equal(call1.args[1], 'a', 'second argument is the property key');
    t.equal(call1.args[2], obj, 'third argument is the original object');

    var call2 = spy.getCall(1);
    t.equal(call2.args[0], 2, 'first argument is the property value');
    t.equal(call2.args[1], 'b', 'second argument is the property key');
    t.equal(call2.args[2], obj, 'third argument is the original object');
  });

  t.end();

});

tape('loop with bound context', function(t) { 

  ChromeAppManager.require(['loopProps'], function(loopProps) {

    var obj = { n: 3 }
    var context = { count: 42 };

    var spy = sinon.spy();

    loopProps(obj, spy, context);

    t.ok(spy.calledOnce, 'iterator is called once for each property');
    t.ok(spy.calledOn(context), 'iterator is called on the specified context');
  });

  t.end();

});


/**
 * module utils/filter-objects.js
 */

tape('module filter-objects.js:', function(t) { t.end(); });

tape('interface', function(t) { 

  ChromeAppManager.require(['filterProps'], function(filterProps) {
    t.equal(typeof filterProps, 'function', 'filterProps is a function');
  });

  t.end();

});

tape('filter object', function(t) { 

  ChromeAppManager.require(['filterProps'], function(filterProps) {

    var base_ = { inherited: { flag: true } };
    var obj = Object.create(base_);

    obj.a = { flag: false };
    obj.b = { flag: true, key: 'b' };
    obj.c = { flag: false };

    var spy = sinon.spy((obj, k, original) => obj.flag === true);

    var res = filterProps(obj, spy);

    t.ok(spy.calledThrice, 'iterator is called once for each own property');

    var call1 = spy.getCall(0);
    t.equal(call1.args[0].flag, false, 'first argument is the property value');
    t.equal(call1.args[1], 'a', 'second argument is the property key');
    t.equal(call1.args[2], obj, 'third argument is the original object');
    t.ok(res.length == 1 && res[0].key == 'b', 'result was computed properly');

  });

  t.end();

});

tape('filter object when no match returns empty array', function(t) { 

  ChromeAppManager.require(['filterProps'], function(filterProps) {

    var obj = {
      a: { flag: false }
    };

    var spy = sinon.spy((obj, k, original) => obj.flag === true);
    var res = filterProps(obj, spy);

    t.ok(spy.calledOnce, 'iterator is called once for each own property');
    t.ok(res.length == 0, 'result was computed properly');

  });

  t.end();

});

tape('filter with bound context', function(t) { 

  ChromeAppManager.require(['filterProps'], function(filterProps) {

    var obj = { a: { qty: 3, id: 1 }, b: { qty: 12, id: 2 } }
    var context = { limit: 10 };

    var spy = sinon.spy(function(obj, k, original) { 
      return obj.qty <= this.limit; 
    });

    var res = filterProps(obj, spy, context);

    t.ok(spy.calledTwice, 'iterator is called once for each property');
    t.ok(spy.calledOn(context), 'iterator is called on the specified context');
    t.ok(res.length == 1 && res[0].id == 1, 'result was computed properly');

  });

  t.end();

});



function setup_(dom) {
  document.body.innerHTML = dom;
}

function teardown_(dom) {
  document.body.innerHTML = '';
}