/**
 * Application entry point.
 */
require([
  'jquery',
  'd3',
  'handlebars',
  'backbone',
  'embed/router'
], function($, d3, Handlebars, Backbone, RouterView) {

  'use strict';

  var EmbedPage = Backbone.View.extend({

    el: document.body,

    initialize: function() {
      this._handlebarsPlugins();
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

  new EmbedPage();

});
