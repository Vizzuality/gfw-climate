define([
  'backbone',
  'underscore',
  'utils',
  'compare/services/PlaceService'
  ], function(Backbone, _, utils, PlaceService) {

  var Router = Backbone.Router.extend({

    routes: {
      'compare-countries(/:compare1)(/:compare2)' : '_initIndex'
    },

    initialize: function() {
      this.placeService = new PlaceService(this);
    },

    _initIndex: function() {
      this.name = 'compare-countries';
      this.initView.apply(this, arguments);
    },

    initView: function(compare1, compare2) {
      var params = _.extend({
        compare1: compare1,
        compare2: compare2,
      }, _.parseUrl());
      this.placeService.initPlace(this.name, params);
    }

  });

  return Router;

});
