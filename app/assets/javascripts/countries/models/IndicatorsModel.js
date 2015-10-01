define([
  'backbone',
  'jquery'
], function(Backbone, $) {

  var CountryModel = Backbone.Model.extend({

    url: '',

    getByParams: function(ind) {
      // console.log(ind)
      this.url = ind;
      return this.fetch();
    },

    parse: function(data) {
      return data;
    }

  });

  return new CountryModel();

});
