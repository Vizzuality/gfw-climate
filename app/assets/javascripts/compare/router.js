define([
  'backbone',
  'compare/services/PlaceService',
  'compare/views/CompareIndexView'
], function(Backbone, PlaceService, CompareIndexView) {

  var Router = Backbone.Router.extend({

    routes: {
      'compare-countries(/:country)(:jurisdiction)(/:country2)(:jurisdiction2)(/:country3)(:jurisdiction3)' : '_initIndex'
    },

    initialize: function() {
      this.placeService = new PlaceService(this);
    },

    _initIndex: function() {
      new CompareIndexView();
    }

  });

  return Router;

});
