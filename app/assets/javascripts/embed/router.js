define([
  'backbone',
  'utils',
  'embed/services/PlaceService',
  'embed/views/show/EmbedCountryView',
  'embed/views/show/EmbedCountryHeaderView'
], function(Backbone, utils, PlaceService, EmbedCountryView, EmbedCountryHeaderView) {

  var Router = Backbone.Router.extend({

    routes: {
      'pantropical'                         : '_initPantropical',
      'countries(/)(:location)(/)(:widget)' : '_initShow',
    },

    initialize: function() {
      this.placeService = new PlaceService(this);
    },

    _initShow: function(location, widget) {
      this.name = 'embed';
      var params = _.extend({
        location: location,
        widget: widget,
      }, _.parseUrl());

      new EmbedCountryHeaderView();
      new EmbedCountryView();      

      this.placeService.initPlace(this.name, params);
    },

  });

  return Router;

});