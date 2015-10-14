define([
  'backbone',
  'jquery'
], function(Backbone, $) {

  var CountryModel = Backbone.Model.extend({

    initialize: function() {
      this.url += this.get('id');
    },

    url: '/api/countries/',

    parse: function(data) {
      return data.country;
    }

  });

  return CountryModel;

});
