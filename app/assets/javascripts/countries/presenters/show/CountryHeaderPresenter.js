define([
  'mps',
  'backbone',
  'countries/presenters/PresenterClass'
], function(mps, Backbone, PresenterClass) {

  'use strict';

  var CountryHeaderPresenter = PresenterClass.extend({

    status: new (Backbone.Model.extend({
      defaults: {
        country: '',
        area: ''
      }
    })),

    init: function(view) {
      this._super();
      this.view = view

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
      p.country = this.status.attributes.country;
      p.area = this.status.attributes.area;

      return p;
    },

    /**
     * Triggered from 'Place/Go' events.
     *
     * @param  {Object} place PlaceService's place object
     */
    _onPlaceGo: function(place) {
      this.status.set('country', place.country);
      this.status.set('area', place.area);
    },

  });

  return CountryHeaderPresenter;

});
