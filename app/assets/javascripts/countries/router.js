define([
  'backbone',
  'utils',
  'countries/services/PlaceService',
  'countries/views/CountryIndexView',
  'countries/views/CountryShowView',
  'countries/views/CountryPantropicalView',
  'countries/views/Pantropical/PantropicalGladAlertsView'
], function(Backbone, utils, PlaceService, CountryIndexView,
  CountryShowView,CountryPantropicalView, PantropicalGladAlertsView) {

  'use strict';

  var Router = Backbone.Router.extend({

    routes: {
      'countries'                           : '_initIndex',
      'pantropical'                         : '_initPantropical',
      'countries(/)(:country)(/)(:view)'    : '_initShow'
    },

    initialize: function() {
      this.placeService = new PlaceService(this);
    },

    _initIndex: function() {
      new CountryIndexView();
    },

    _initShow: function(country, view) {

      new CountryShowView();

      var params = _.extend({
        country: country,
        view: view
      }, _.parseUrl());

      this.placeService.initPlace(params);
    },

    _initPantropical: function() {
      ga('send', 'event', 'pantropical','Choose visualisation','All countries');
      new CountryPantropicalView();

      new PantropicalGladAlertsView();
    }
  });

  return Router;

});
