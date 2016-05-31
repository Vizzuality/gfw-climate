define([
  'mps',
  'backbone',
  'jquery'
], function(mps, Backbone, $) {

  var CountryModel = Backbone.Model.extend({

    url: '/api/countries/',

    initialize: function(setup) {
      this.url += setup.iso;
    },

    parse: function(data) {
      return data.country;
    }

  });

  return CountryModel;

});
