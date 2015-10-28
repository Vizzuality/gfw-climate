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
        defaults: {
          view: 'national'
        }
      }));

      this._setListeners();
    },

    /**
     * Application subscriptions.
     */
    _subscriptions: [{
      'Place/go': function(place) {
        this._onPlaceGo(place);
      }
    }, {
      'View/update': function(view) {
        this.setDisplay(view);
      }
    }],

    _setListeners:function() {
      this.status.on('change:view', this.onUpdateTab, this);
    },


    /**
     * Triggered from 'Place/Go' events.
     *
     * @param  {Object} place PlaceService's place object
     */
    _onPlaceGo: function(params) {
      this._setupView(params);
      this.view.start();
    },

    _setupView: function(params) {

      if(params.view) {
        this.status.set({
          view: params.view
        }, {silent: true});
      }
    },

    setDisplay: function(display) {
      this.status.set({
        view: display
      });
    },

    onUpdateTab: function() {
      this.view._setCurrentTab();
      mps.publish('View/update', [this.status.get('view')])
    },

  });

  return TabsPresenter;

});
