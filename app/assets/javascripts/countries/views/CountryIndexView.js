define([
  'backbone',
  'countries/views/index/CountryListView'
], function(Backbone, CountryListView) {

  'use strict';

  var CountryIndexView = Backbone.View.extend({

    initialize:function() {
      new CountryListView();
    }

  });

  return CountryIndexView;

});
