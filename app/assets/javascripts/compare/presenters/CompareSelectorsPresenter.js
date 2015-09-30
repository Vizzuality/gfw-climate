define([
  'Backbone',
  'mps',
  'compare/presenters/PresenterClass',
  'compare/collections/CountriesCollection'
], function(Backbone, mps, PresenterClass, CountriesCollection) {

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
      this.collection = CountriesCollection;
      mps.publish('Place/register', [this]);
    },

    /**
     * Application subscriptions.
     */
    _subscriptions: [{
      'Place/go': function(place) {
        this._onPlaceGo(place);
      }
    }],


    /**
     * Used by PlaceService to get the current iso/area params.
     *
     * @return {object} iso/area params
     */
    getPlaceParams: function() {
      var p = {};
      p.country1 = this.status.get('country1');
      p.country2 = this.status.get('country2');
      p.country3 = this.status.get('country3');
      return p;
    },

    /**
    * Triggered from 'Place/Go' events.
    *
    * @param  {Object} place PlaceService's place object
    */
    _onPlaceGo: function(place) {
      this.status.set('country1', place.params.country1);
      this.status.set('country2', place.params.country2);
      this.status.set('country3', place.params.country3);

      var data;
      // Fetching data
      var complete = _.invoke([
        data = this.collection,
      ], 'fetch');

      $.when.apply($, complete).done(function() {
        this.view.setValuesFromUrl(data);
      }.bind(this));
    },

    updateStatus: function(selector, country) {
      var selectedCountry = country !== 'no_country' ? country : null;
      this.status.set(selector, selectedCountry);
      mps.publish('Place/update');
    },

    /*
     * When some countries selected and compare button clicked...
     */
    countriesSelected: function() {
      mps.publish('Compare/countriesSelected', [this.getPlaceParams()]);
    }

  });

  return CompareSelectorsPresenter;

});
