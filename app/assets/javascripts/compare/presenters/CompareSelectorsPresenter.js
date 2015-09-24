define([
  'mps',
  'compare/presenters/PresenterClass'
], function(mps, PresenterClass) {

  'use strict';

  var CompareSelectorsPresenter = PresenterClass.extend({

    init: function(view) {
      console.log('ComparePresenter')
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
        console.log(place);
     },

  });

  return CompareSelectorsPresenter;

});
