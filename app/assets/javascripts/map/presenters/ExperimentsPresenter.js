/**
 * The ExperimentsPresenter.
 *
 * @return ExperimentsPresenter class
 */
define([
  'underscore',
  'enquire',
  'mps',
  'map/presenters/PresenterClass'
], function(_, enquire, mps, PresenterClass) {

  'use strict';

  var ExperimentsPresenter = PresenterClass.extend({

    init: function() {
      this._super();
      this._experiments = {
        'source' : {
          id: 'YjvD0sRXQKO2Tde4W-sEcA',
          fn: this._source,
        },
        'autolocate' : {
          id: '5wKv-ZqdRmWMoonTLlwAKw',
          fn: this._autolocate
        }
      }
    },

    setVariation: function(id,len){
      if (cxApi.getChosenVariation(id) < 0) {
        cxApi.setChosenVariation(Math.floor(Math.random()*len),id);
      }
      var variation = cxApi.getChosenVariation(id);
      return variation;
    },

    /**
     * Google Experiments.
     */
    _source: function(id){
      var cxApiExists = !!cxApi || false;
      if (cxApiExists) {
        var variation = this.setVariation(id,3);

        switch(variation){
          case 0:
            $('.source').removeClass('default blue yellow').addClass('default');
          break;
          case 1:
            $('.source').removeClass('default blue yellow').addClass('blue');
          break;
          case 2:
            $('.source').removeClass('default blue yellow').addClass('yellow');
          break;
          default:
            $('.source').removeClass('default blue yellow').addClass('default');
          break;
        }
      }
    },

    _autolocate: function(id){
      enquire.register("screen and (max-width:"+window.gfw.config.GFW_MOBILE+"px)", {
        match: _.bind(function(){
          var variation = this.setVariation(id,2);
          mps.publish('Map/autolocate');
          if (!!variation) {
          }
        },this)
      });

    },

    /**
     * Application subscriptions.
     */
    _subscriptions: [{
      'Experiment/choose': function(id) {
        this._experiments[id].fn.apply(this,[this._experiments[id].id]);
      }
    }]

  });

  return ExperimentsPresenter;
});
