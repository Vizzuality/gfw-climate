define([
  'mps',
  'countries/presenters/PresenterClass'
], function(mps, PresenterClass) {

  'use strict';

  var globalWidgetStatus = {};

  var WidgetPresenter = PresenterClass.extend({

    status: new (Backbone.Model.extend({
      defaults: {
        average: null,
        id: null,
        indicator: 1,
        treshold: 30
      }
    })),

    init: function(view) {
      this.view = view;
      this._super();

      this.status.set('id', view.wid);

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

      p.widgetStatus = {
        average: this.status.attributes.average,
        id: this.status.attributes.id,
        indicator: this.status.attributes.indicator,
        treshold: this.status.attributes.treshold
      };

      console.log(p);

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
