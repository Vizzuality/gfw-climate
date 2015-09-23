define([
  'backbone',
  'compare/views/compareTestView',
  'compare/services/PlaceService'
], function(Backbone, CompareTestView, PlaceService) {

  var Router = Backbone.Router.extend({

    routes: {
      'compare-countries/:country(:jurisdiction)/:country2(:jurisdiction2)/:country3(:jurisdiction3)' : '_initIndex'
    },

    initialize: function() {
      this.placeService = new PlaceService(this);
    },

    _initIndex: function() {
      console.log('router compare')
      new CompareTestView();
    }

  });

  return Router;

});
