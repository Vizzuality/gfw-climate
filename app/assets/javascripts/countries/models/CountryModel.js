define([
  'backbone',
], function(Backbone) {

  var CountryModel = Backbone.Model.extend({

    url: '/countries/',

    initialize: function(arguments) {
      // this.fetch({data: {
      //   iso: arguments.iso
      // }});
    },

    parse: function(data) {
      return data;
    }

  });

  return CountryModel;

});
