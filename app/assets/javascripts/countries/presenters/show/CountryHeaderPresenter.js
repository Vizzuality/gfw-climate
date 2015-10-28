define([
  'mps',
  'backbone',
  'countries/presenters/PresenterClass'
], function(mps, Backbone, PresenterClass) {

  'use strict';

  var CountryHeaderPresenter = PresenterClass.extend({

    init: function(view) {
      this._super();
      this.view = view

      this.status = new (Backbone.Model.extend()),

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
      return p;
    },

    /**
     * Triggered from 'Place/Go' events.
     *
     * @param  {Object} place PlaceService's place object
     */
    _onPlaceGo: function(place) {
      this._setCountry(place.country.iso);
      this.view.start();
    },

    _setCountry: function(country) {
      this.status.set({
        iso: country
      });
    }

  });

  return CountryHeaderPresenter;

});
