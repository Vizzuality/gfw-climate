define([
  'backbone',
  'utils',
  'embed/services/PlaceService',
  'embed/views/show/EmbedCountryView',
  'embed/views/show/EmbedCountryHeaderView',
  'views/SourceModalView',  
], function(Backbone, utils, PlaceService, EmbedCountryView, EmbedCountryHeaderView, SourceModalView) {

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

      // global views
      new SourceModalView();
      
      this.placeService.initPlace(this.name, params);
    },

  });

  return Router;

});