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
      'Tab/update': function(opts) {
        this.setDisplay(opts);
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

    setDisplay: function(opts) {

      if (opts.silent) {
        this.status.set({
          view: opts.view
        }, {silent: true});
      } else {
        this.status.set({
          view: opts
        });
      }

      this.view._setCurrentTab();
    },

    onUpdateTab: function() {
      this.view._setCurrentTab();
      mps.publish('View/update', [this.status.get('view')]);
    },

  });

  return TabsPresenter;

});
