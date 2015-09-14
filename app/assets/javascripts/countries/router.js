define([
  'backbone',
  'countries/views/CountryIndexView',
  'countries/views/CountryShowView'
], function(Backbone, CountryIndexView, CountryShowView) {

  var Router = Backbone.Router.extend({

    routes: {
      'countries'                          : '_initIndex',
      'countries/overview'                 : '_initOverview',
      'countries/:country(/:jurisdiction)' : '_initShow'
    },

    _initIndex: function() {
      new CountryIndexView();
    },

    _initShow: function(arguments) {
      new CountryShowView({data: arguments});
    },

    _initOverview: function() {

    }

  });

  return Router;

});
