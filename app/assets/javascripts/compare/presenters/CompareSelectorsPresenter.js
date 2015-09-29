define([
  'Backbone',
  'mps',
  'compare/presenters/PresenterClass'
], function(Backbone, mps, PresenterClass) {

  'use strict';

  var CompareSelectorsPresenter = PresenterClass.extend({

    status: new (Backbone.Model.extend({
      name: 'compare-countries'
    })),

    init: function(view) {
      this._super();
      this.view = view;
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
      console.log(place);
    },

    countrySelected: function(selector, country) {
      this.status.set(selector, country);
      mps.publish('Place/update');
    }

  });

  return CompareSelectorsPresenter;

});
