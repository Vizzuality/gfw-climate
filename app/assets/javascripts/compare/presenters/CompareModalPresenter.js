define([
  'Backbone',
  'mps',
  'compare/collections/CountriesCollection',
  'compare/presenters/PresenterClass',
], function(Backbone, mps, countries, PresenterClass) {

  'use strict';

  var CompareSelectorsPresenter = PresenterClass.extend({

    status: new (Backbone.Model.extend({
      defaults: {
        name: 'compare-countries'
      }
    })),

    init: function(view) {
      this._super();
      this.view = view;
      this.countries = countries;
      mps.publish('Place/register', [this]);
    },

    /**
     * Application subscriptions.
     */
    _subscriptions: [{
      'Place/go': function(place) {
        this._onPlaceGo(place);
      },
      'CompareModal/show': function() {
        this.view.show();
      }
    }],


    /**
     * Used by PlaceService to get the current iso/area params.
     *
     * @return {object} iso/area params
     */
    getPlaceParams: function() {
      var p = {};
      p.compare1 = this.status.get('compare1');
      p.compare2 = this.status.get('compare2');
      return p;
    },

    /**
    * Triggered from 'Place/Go' events.
    *
    * @param  {Object} place PlaceService's place object
    */
    _onPlaceGo: function(place) {
      this.status.set('compare1', place.params.compare1);
      this.status.set('compare2', place.params.compare2);

      // Fetching data
      var complete = _.invoke([
        this.countries
      ], 'fetch');

      $.when.apply($, complete).done(function() {
        var countries = arguments[0].countries;
        this.view.setFields(countries);
      }.bind(this));
    },

  });

  return CompareSelectorsPresenter;

});
