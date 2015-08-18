define([
  'backbone',
  'countries/views/CountryListView',
  'countries/views/CountryShowHeaderView',
  'countries/views/CountryIndicatorsView',
], function(Backbone, CountryListView, CountryShowHeaderView, CountryIndicatorsView) {

  var Router = Backbone.Router.extend({

    routes: {
      'countries' : '_initList',
      'countries/:id' : '_initShow',
      'countries/overview' : '_initOverview',
    },

    _initList: function() {
      new CountryListView();
    },

    _initShow: function() {
      new CountryShowHeaderView();
      new CountryIndicatorsView();
    },

    _initOverview: function() {

    }

  });

  return Router;

});
