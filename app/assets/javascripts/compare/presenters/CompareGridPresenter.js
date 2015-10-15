define([
  'Backbone',
  'mps',
  'compare/presenters/PresenterClass',
  'compare/services/CompareService'
], function(Backbone, mps, PresenterClass, CompareService) {

  'use strict';

  var CompareMainPresenter = PresenterClass.extend({

    status: new (Backbone.Model.extend({
      defaults: {
        name: 'compare-countries'
      }
    })),

    init: function(view) {
      this._super();
      this.service = CompareService;
      this.view = view;
    },

    /**
     * Application subscriptions.
     */
    _subscriptions: [{
      'Place/go': function(params) {
        this._onPlaceGo(params);
      },

      'Compare/selection': function(params) {
        this._onSelectionUpdate(params)
      },

    }],


    _onPlaceGo: function(params) {
      if (!!params.compare1 && !!params.compare2) {

      //   // Fetching data
      //   var complete = _.invoke([
      //     new CountriesCollection(),
      //     new CountryModel({ id: params.compare1.iso }),
      //     new CountryModel({ id: params.compare2.iso }),
      //   ], 'fetch');

      //   $.when.apply($, complete).done(function() {
      //     // Set model for render
      //     this.status.set('countries', arguments[0][0].countries);
      //     this.status.set('country1', arguments[1][0].country);
      //     this.status.set('country2', arguments[2][0].country);
      //     this.view.render();
      //     // Set model for compare selects
      //     this.status.set('compare1', params.compare1);
      //     this.status.set('compare2', params.compare2);
      //   }.bind(this));
      // } else {
      //   // Fetching data
      //   var complete = _.invoke([
      //     new CountriesCollection(),
      //   ], 'fetch');

      //   $.when.apply($, complete).done(function() {
      //     // Set model for render
      //     this.status.set('countries', arguments[0].countries);
      //     this.view.render();
      //   }.bind(this));
      }
    },


    _onSelectionUpdate: function(params) {
      console.log(params);
      if (!!params.compare1 && !!params.compare2) {}
    },

  });

  return CompareMainPresenter;

});
