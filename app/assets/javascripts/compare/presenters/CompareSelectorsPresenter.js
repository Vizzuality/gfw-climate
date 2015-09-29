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
      },

      'compare/countriesSelected': function() {
        var data;
        // Fetching data
        var complete = _.invoke([
          data = this.collection,
        ], 'fetch');

        $.when.apply($, complete).done(function() {
          this.view.countriesFromUrl(data);
        }.bind(this));

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
      // this.status.set('name', place.params.country1);
      this.status.set('country1', place.params.country1);
      this.status.set('country2', place.params.country2);
      this.status.set('country3', place.params.country3);
      mps.publish('compare/countriesSelected');
    },

    updateStatus: function(selector, country) {
      this.status.set(selector, country);
      mps.publish('Place/update');
    }

  });

  return CompareSelectorsPresenter;

});
