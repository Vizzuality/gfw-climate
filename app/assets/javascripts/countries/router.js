define([
  'backbone',
  'countries/views/CountryListView'
], function(Backbone, CountryListView) {

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
      console.log('show');
    },

    _initOverview: function() {

    }

  });

  return Router;

});
