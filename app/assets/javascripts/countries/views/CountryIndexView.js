define(['backbone', 'countries/views/index/CountryListView'], function(
  Backbone,
  CountryListView
) {
  'use strict';

  var CountryIndexView = Backbone.View.extend({
    initialize: function() {
      ga('send', 'event', 'country', 'Search');
      this.countryList = new CountryListView();
    }
  });

  return CountryIndexView;
});
