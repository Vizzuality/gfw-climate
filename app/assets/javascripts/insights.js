/**
 * Application entry point.
 */
require([
  'backbone',
  'insights/router'
], function(Backbone,RouterView) {

  'use strict';

  var InsightsPage = Backbone.View.extend({

    el: document.body,

    initialize: function() {
      this._initRouter();
      this._initApp();
    },

    /**
     * Initialize the map by starting the history.
     */
    _initApp: function() {
      if (!Backbone.History.started) {
        Backbone.history.start({pushState: true});
      }
    },

    _initRouter: function() {
      this.router = new RouterView();
    },

  });

  new InsightsPage();

});
