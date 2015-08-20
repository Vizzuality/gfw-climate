define([
  'backbone',
  'jquery'
], function(Backbone, $) {

  var CountryModel = Backbone.Model.extend({

    url: '/api/countries/',

    setCountry: function(country) {
      this.url += country;
      console.log(this.url);
    },

    parse: function(data) {
      return data.country;
    }

  });

  return CountryModel;

});
