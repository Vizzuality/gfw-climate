define([
  'backbone',
  'utils',
  'embed/services/PlaceService',
  'embed/views/show/EmbedCountryView',
  'embed/views/show/EmbedCountryHeaderView',
  'embed/views/show/EmbedInsightsView',
  'embed/views/pantropical/PantropicalView',
  'views/SourceModalView',
], function(Backbone, utils, PlaceService, EmbedCountryView,
  EmbedCountryHeaderView, EmbedInsightsView, PantropicalView,
  SourceModalView) {

  var Router = Backbone.Router.extend({

    routes: {
      'pantropical'                         : '_initPantropical',
      'countries(/)(:location)(/)(:widget)' : '_initShow',
      'insights(/)(:insight)(/)(:iso)'      : '_initInsights'
    },

    initialize: function() {
      this.placeService = new PlaceService(this);
    },

    _initPantropical: function() {
      new PantropicalView();
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

    _initInsights: function(insight, iso) {
      new EmbedInsightsView({
        insight: insight,
        iso: iso
      });
    }

  });

  return Router;

});
