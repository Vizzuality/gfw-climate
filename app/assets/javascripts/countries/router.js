define([
  'backbone',
  'countries/views/CountryListView',
  'countries/views/CountryShowHeaderView',
  'countries/views/CountryIndicatorsView',
], function(Backbone, CountryListView, CountryShowHeaderView, CountryIndicatorsView) {

  var Router = Backbone.Router.extend({

    routes: {
      'countries'                        : '_initList',
      'countries/:country(/:jurisdiction)' : '_initShow',
      'countries/overview'               : '_initOverview',
    },

    _initList: function() {
      new CountryListView();
    },

    _initShow: function(country, jurisdiction) {
      new CountryShowHeaderView({
        country: country,
        jurisdiction: jurisdiction
      });
      new CountryIndicatorsView();
    },

    _initOverview: function() {

    }

  });

  return Router;

});
