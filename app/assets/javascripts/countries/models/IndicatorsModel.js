define([
  'backbone',
  'jquery'
], function(Backbone, $) {

  var CountryModel = Backbone.Model.extend({

    url: '/api/indicators/',

    getByParams: function(params) {
      var country = params.country,
        url = params.url;

      this.url = url + '/' + country;

      return this.fetch();
    },

    parse: function(data) {
      return data;
    }

  });

  return new CountryModel();

});
