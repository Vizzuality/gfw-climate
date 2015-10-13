define([
  'backbone',
  'jquery'
], function(Backbone, $) {

  var CountriesCollection = Backbone.Model.extend({

    url: '/api/countries/',

    parse: function(data) {
      return data;
    }

  });

  return CountriesCollection;

});
