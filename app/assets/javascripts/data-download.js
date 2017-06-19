/**
 * Application entry point.
 */
require(['jquery', 'underscore', 'backbone', 'data-download/router'], function(
  $,
  _,
  Backbone,
  RouterView
) {
  'use strict';
  var DataDownloadPage = Backbone.View.extend({
    el: document.body,

    initialize: function() {
      this._initRouter();
      this._initApp();
    },

    _initApp: function() {
      if (!Backbone.History.started) {
        Backbone.history.start({ pushState: true });
      }
    },

    _initRouter: function() {
      this.router = new RouterView();
    }
  });

  new DataDownloadPage(); // eslint-disable-line
});
