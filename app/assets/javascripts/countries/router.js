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
      console.log('inti');
      new CountryListView();
    }

  });

  return Router;

});
