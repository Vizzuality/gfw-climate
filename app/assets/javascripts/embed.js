/**
 * Application entry point.
 */
require([
  'jquery',
  'd3',
  'handlebars',
  'helpers/handlebarsPlugins',  
  'backbone',
  'embed/router'
], function($, d3, Handlebars, HandlebarsPlugins, Backbone, RouterView) {

  'use strict';

  var EmbedPage = Backbone.View.extend({

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
        Backbone.history.start({
          pushState: true,
          root: '/embed'
        });
      }
    },

    _initRouter: function() {
      this.router = new RouterView();
    },

  });

  new EmbedPage();

});
