define([
  'mps',
  'backbone',
  'countries/presenters/PresenterClass'
], function(mps, Backbone, PresenterClass) {

  'use strict';

  var TabsPresenter = PresenterClass.extend({

    init: function(view) {
      this.view = view;
      this._super();

      this.status = new (Backbone.Model.extend({
        // defaults: {
        //   view: 'national'
        // }
      }));

      this._setListeners();

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

    _setListeners:function() {
      this.status.on('change:view', this.onUpdateTab, this);
    },

    /**
     * Used by PlaceService to get the current iso/area params.
     *
     * @return {object} iso/area params
     */
    getPlaceParams: function() {
      var p = {};
      p.view = this.status.get('view');
      return p;
    },

    /**
     * Triggered from 'Place/Go' events.
     *
     * @param  {Object} place PlaceService's place object
     */
    _onPlaceGo: function(params) {
      this._setupView(params);
    },

    _setupView: function(params) {

      if(params.view) {
        this.setDisplay(params.view);
      }
    },

    setDisplay: function(display) {
      this.status.set({
        view: display
      });
    },

    onUpdateTab: function() {
      this.view._setCurrentTab();
      mps.publish('Place/update', []);
      mps.publish('View/update', [this.status.get('view')])
    },

  });

  return TabsPresenter;

});
