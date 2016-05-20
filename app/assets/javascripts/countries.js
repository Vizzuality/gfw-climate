/**
 * Application entry point.
 */
require([
  'jquery',
  'underscore',
  'backbone',
  'handlebars',
  'countries/router',
  'countries/views/CountryShowView',
  'countries/views/CountryIndexView'
], function($, _, Backbone, Handlebars, RouterView, CountryShowView, CountryIndexView) {

  'use strict';

  var CountriesPage = Backbone.View.extend({

    el: document.body,

    initialize: function() {
      this._handlebarsPlugins();
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
    },

    _handlebarsPlugins: function() {
      Handlebars.registerHelper('ifCond', function (v1, operator, v2, options) {
        switch (operator) {
          case '==':
            return (v1 == v2) ? options.fn(this) : options.inverse(this);
          case '===':
            return (v1 === v2) ? options.fn(this) : options.inverse(this);
          case '!==':
            return (v1 !== v2) ? options.fn(this) : options.inverse(this);
          case '<':
            return (v1 < v2) ? options.fn(this) : options.inverse(this);
          case '<=':
            return (v1 <= v2) ? options.fn(this) : options.inverse(this);
          case '>':
            return (v1 > v2) ? options.fn(this) : options.inverse(this);
          case '>=':
            return (v1 >= v2) ? options.fn(this) : options.inverse(this);
          case '&&':
            return (v1 && v2) ? options.fn(this) : options.inverse(this);
          case '||':
            return (v1 || v2) ? options.fn(this) : options.inverse(this);
          default:
            return options.inverse(this);
        }
      });
    }


  });

  new CountriesPage();

});
