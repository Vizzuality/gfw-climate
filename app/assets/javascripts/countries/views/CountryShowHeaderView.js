define([
  'backbone',
  'countries/models/CountryModel'
], function(Backbone, CountryModel) {

  var CountryShowHeaderView = Backbone.View.extend({

    initialize: function() {
      this.model = new CountryModel({iso: 'ARG'});
    }

  });

  return CountryShowHeaderView;

});
