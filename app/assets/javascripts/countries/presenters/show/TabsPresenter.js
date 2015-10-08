define([
  'mps',
  'backbone',
  'countries/presenters/PresenterClass'
], function(mps, Backbone, PresenterClass) {

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
     * Triggered from 'Place/Go' events.
     *
     * @param  {Object} place PlaceService's place object
     */
    _onPlaceGo: function(place) {
      this.view.start(place);
    },

    onUpdateTab: function(tab) {
      this.status.set('data', tab);
    },

    updateStatus: function(tab) {
      this.onUpdateTab(tab);
      mps.publish('Place/update');
    }

  });

  return TabsPresenter;

});
