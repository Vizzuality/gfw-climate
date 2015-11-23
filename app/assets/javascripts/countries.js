/**
 * Application entry point.
 */
require([
  'jquery',
  'underscore',
  'backbone',
  'countries/router',
  'countries/views/CountryShowView',
  'countries/views/CountryIndexView',
  // 'countries/views/CountryModalView'
], function($, _, Backbone, RouterView, CountryShowView, CountryIndexView) {

  'use strict';

  var CountriesPage = Backbone.View.extend({

    el: document.body,

    initialize: function() {
      this._initRouter();
      this._initViews();
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

    _initViews: function() {
      new CountryIndexView();
    },

    _initRouter: function() {
      this.router = new RouterView();
    }

  });

  new CountriesPage();

});
