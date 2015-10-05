define([
  'Backbone',
  'mps',
  'compare/presenters/PresenterClass',
  'compare/collections/CountriesCollection'
], function(Backbone, mps, PresenterClass, CountriesCollection) {

  'use strict';

  var CompareMainPresenter = PresenterClass.extend({

    status: new (Backbone.Model.extend({
      defaults: {
        name: 'compare-countries'
      }
    })),

    init: function(view) {
      this._super();
      this.view = view;
    },

    /**
     * Application subscriptions.
     */
    _subscriptions: [{
      'Compare/countriesSelected': function(params) {
        this._setSelectedCounties(params);
      }
    }],


    _setSelectedCounties: function(params) {
      console.log(params);
    }

  });

  return CompareMainPresenter;

});
