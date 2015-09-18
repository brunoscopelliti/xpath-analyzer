
window.onload = function () {

  'use strict';

  var require = ChromeAppManager.require;

  function main(Model, view, delegate) {

    const LEFT_ARROW_KEYCODE = 37;
    const RIGHT_ARROW_KEYCODE = 39;
    const ENTER_KEYCODE = 13;

    

    var $$ = document.querySelectorAll.bind(document);

    

    // setup the app model
    // with model name 'xapp'
    var model_ = new Model('xapp', { tab: 'xml-input', tabs: { 'xml-input': 1, 'xpath-analyzer': 2, 'credits': 3 } });


    // register the views

    view.register('xml-input', {
      selector: '[data-tab="xml-input"]',
      next: 'xpath-analyzer',
      isSelected: true,
      setup: require(['xhr'], function(xhr) {

        return function() {

          function getXML(evt){
            if (evt.which != ENTER_KEYCODE){
              return;
            }

            // @todo handle loading

            evt.preventDefault();
            let req = xhr(this.value);
            req.then(function(res){
            
              // well, everything is fine, so just save in the model a reference
              // to the loaded xml, and select next tab
              model_.set('xml-loaded', true);
              model_.set('xml', res.xml);
              model_.set('tab', view('xml-input').next);
            
            }).catch(function(err){

              // @todo handle error
              console.log("fail:",err);

            });
          }

          // store the getXML function into the view private data store,
          // so that then the teardown method can retrieve a reference, and remove the listener
          view('xml-input').store('keyupFn', getXML);

          $$('#url')[0].addEventListener('keyup', getXML, true);

        };

      }),
      teardown: function() {
        var fn = this.read('keyupFn');
        $$('#url')[0].removeEventListener('keyup', fn, true);
      }
    });

    view.register('xpath-analyzer', { 
      selector: '[data-tab="xpath-analyzer"]',
      prev: 'xml-input',
      next: 'credits',
      get isEnabled() {
        return model_.get('xml-loaded');
      },
      setup: require([], function() {

        return function() {

          function parseXML(evt){}

          view('xpath-analyzer').store('keyupFn', parseXML);

          $$('#xpath')[0].addEventListener('keyup', fn, true);

        };

      }),
      teardown: function() {
        var fn = view('xpath-analyzer').read('keyupFn');
        $$('#xpath')[0].removeEventListener('keyup', fn, true);
      }
    });

    view.register('credits', { 
      selector: '[data-tab="credits"]',
      prev: 'xpath-analyzer'
    });
    


    // when the selected tab changes
    // we have to change the displayed view
    model_.watch('tab', function(key, oldVal, newVal, undo) {
      view(newVal).select().then(show, undo);
    });

    function show(view){
      $$('#slide-container')[0].className = 'view'+view.guid_;
    }


    // add event listener for the events
    // used to change the selected tab
    document.addEventListener('keyup', function(evt) {
      if ([LEFT_ARROW_KEYCODE, RIGHT_ARROW_KEYCODE].indexOf(evt.which)<0){
        return;
      }
      evt.preventDefault();
      let viewName = evt.which == LEFT_ARROW_KEYCODE ? view(':selected').prev : view(':selected').next;
      if (viewName){
        model_.set('tab', viewName);  
      }
    });


    $$('#nav')[0].addEventListener('click', delegate('.dot', function(evt) {  
      model_.set('tab', this.dataset.tabBtn);
    }));

  }

  require(['Model', 'view', 'delegate'], main);

};

