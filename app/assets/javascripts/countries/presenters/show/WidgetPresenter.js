define([
  'mps',
  'backbone',
  'countries/presenters/PresenterClass'
], function(mps, Backbone, PresenterClass) {

  'use strict';

  var WidgetPresenter = PresenterClass.extend({

    init: function(view) {
      this.view = view;
      this._super();

      this.status = new (Backbone.Model.extend());

      mps.publish('Place/register', [this]);
    },

    /**
     * Application subscriptions.
     */
    // _subscriptions: [{
    //   'Place/go': function(place) {
    //     this._onPlaceGo(place);
    //   }
    // }],

    /**
     * Used by PlaceService to get the current iso/area params.
     *
     * @return {object} iso/area params
     */
    getPlaceParams: function() {
      var p = {};

      debugger;

      p.widgetStatus = {
        average: this.status.get('average'),
        id: this.status.get('id'),
        indicator: this.status.get('indicator'),
        treshold: this.status.get('treshold'),
        unit: this.status.get('unit')
      };

      return p;
    },

    /**
     * Triggered from 'Place/Go' events.
     *
     * @param  {Object} place PlaceService's place object
     */
    // _onPlaceGo: function(place) {
    //   this.view.start(place);
    // },

    onUpdateIndicator: function(status) {
      this.status.set(status);
    },

    updateStatus: function(status) {
      this.onUpdateIndicator(status);
      mps.publish('Place/update');
    }

  });

  return WidgetPresenter;

});
