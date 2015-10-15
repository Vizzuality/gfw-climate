define([
  'mps',
  'backbone',
  'jquery'
], function(mps, Backbone, $) {

  var CountryModel = Backbone.Model.extend({

    url: '/api/countries/',

    setCountry: function(country) {
      this.url += country;
    },

    fetchData: function() {
      $.get(this.url, function(data) {
        this.set(data.country);
        mps.publish('CountryModel/Fetch', [this]);
      }.bind(this));
    },

    parse: function(data) {
      return data.country;
    }

  });

  return new CountryModel();

});
