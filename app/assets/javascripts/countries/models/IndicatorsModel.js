define([
  'backbone',
  'jquery'
], function(Backbone, $) {

  var CountryModel = Backbone.Model.extend({

    url: '/api/countries/',

    getByParams: function(ind) {
      console.log(ind)
      this.url = ind;
      return this.fetch();
    },

    parse: function(data) {
      console.log(data)
      return data;
    }

  });

  return new CountryModel();

});
