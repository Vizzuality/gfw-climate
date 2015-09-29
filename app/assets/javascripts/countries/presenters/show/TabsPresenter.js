define([
  'mps',
  'countries/presenters/PresenterClass'
], function(mps, PresenterClass) {

  'use strict';

  var TabsPresenter = PresenterClass.extend({

    init: function(view) {
      this.view = view;
      this._super();

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
     * Trigger the selected display option
     * @param  {[string]} display
     * Add below events publication
     */




     /**
      * Triggered from 'Place/Go' events.
      *
      * @param  {Object} place PlaceService's place object
      */
     _onPlaceGo: function(place) {
        this.view.start(place);
     },

  });

  return TabsPresenter;

});
