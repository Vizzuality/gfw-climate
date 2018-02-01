define(['backbone', 'data-download/views/DataDownloadIndexView'], function(
  Backbone,
  DataDownloadIndexView
) {
  'use strict';
  var Router = Backbone.Router.extend({
    routes: {
      'data-download': '_initIndex'
    },

    _initIndex: function() {
      this.countryIndex = new DataDownloadIndexView();
    }
  });

  return Router;
});
