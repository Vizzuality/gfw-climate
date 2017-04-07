/**
 * Application entry point.
 */
require([
  'jquery',
  'underscore',
  'backbone',
  'handlebars',
  'helpers/handlebarsPlugins',
  'countries/router',
  'countries/views/CountryShowView',
  'countries/views/CountryIndexView'
], function($, _, Backbone, Handlebars, HandlebarsPlugins, RouterView, CountryShowView, CountryIndexView) {

  'use strict';

  var CountriesPage = Backbone.View.extend({

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

  new CountriesPage();

});
