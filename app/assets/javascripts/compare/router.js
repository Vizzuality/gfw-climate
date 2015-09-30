define([
  'backbone',
  'underscore',
  'map/utils',
  'services/PlaceService'
  ], function(Backbone, _, utils, PlaceService) {

  var Router = Backbone.Router.extend({

    routes: {
      'compare-countries(/:country1)(/:country2)(/:country3)' : '_initIndex'
    },

    initialize: function() {
      this.placeService = new PlaceService(this);
    },

    _initIndex: function() {
      this.name = 'compare-countries';
      this.initView.apply(this, arguments);
    },

    initView: function(country1, country2, country3) {
      var params = _.extend({
        country1: country1,
        country2: country2,
        country3: country3
      }, _.parseUrl());
      this.placeService.initPlace(this.name, params);
    }

  });

  return Router;

});
