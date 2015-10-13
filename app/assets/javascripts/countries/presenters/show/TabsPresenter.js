define([
  'mps',
  'countries/presenters/PresenterClass'
], function(mps, PresenterClass) {

  'use strict';

  var TabsPresenter = PresenterClass.extend({

    status: new (Backbone.Model.extend({
      defaults: {
        data: 'national'
      }
    })),

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
     * Used by PlaceService to get the current iso/area params.
     *
     * @return {object} iso/area params
     */
    getPlaceParams: function() {
      var p = {};
      p.view = this.status.get('data');
      return p;
    },


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

     _updateTab: function(tab) {
      this.status.set('data', tab);
      // mps.publish('Place/update');
     }

  });

  return TabsPresenter;

});
