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

      this._setListeners();

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


    _setListeners: function() {
      this.status.on('change:tab', this.onChangeTab, this);
    },

    setParams: function(options) {
      this.status.set({
        id: options.id,
        name: options.name,
        data: options.data,
        tab: options.tab,
        indicators: options.indicators
      });
    },

    /**
     * Used by PlaceService to get the current iso/area params.
     *
     * @return {object} iso/area params
     */
    getPlaceParams: function() {
      var p = {};

      // p.widgetStatus = {
      //   id: this.status.get('id'),
      //   tab: this.status.get('tab'),
      //   options: {
      //     average: this.status.get('average'),
      //     indicator: this.status.get('indicator'),
      //     treshold: this.status.get('treshold'),
      //     unit: this.status.get('unit')
      //   }
      // };

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

    onUpdateWidget: function(status) {
      this.status.set(status);
    },

    onChangeTab: function() {
      this.view._setTab();
    },

    updateStatus: function(status) {
      this.onUpdateIndicator(status);
      mps.publish('Place/update');
    }

  });

  return WidgetPresenter;

});
