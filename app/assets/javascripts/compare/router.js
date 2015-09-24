define([
  'backbone',
  'underscore',
  'map/utils',
  'compare/services/PlaceService',
  'compare/views/CompareIndexView'
], function(Backbone, _, utils, PlaceService) {

  var Router = Backbone.Router.extend({

    routes: {
      'compare-countries(/:iso1)(:id_1)(/:iso2)(:id_2)(/:iso3)(:id_3)' : '_initIndex'
    },

    initialize: function() {
      this.placeService = new PlaceService(this);
    },

    _initIndex: function() {
      this.name = 'compare-countries';
      this.initView.apply(this, arguments);
      // new CompareIndexView();
    },

    initView: function(iso1, id_1, iso2, id_2, iso3, id_3) {
      var params = _.extend({
        iso1: iso1,
        iso2: iso2,
        iso3: iso3
      }, _.parseUrl());
      this.placeService.initPlace(this.name, params);
    },

  });

  return Router;

});
