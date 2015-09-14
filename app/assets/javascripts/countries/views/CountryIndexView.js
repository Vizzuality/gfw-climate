define([
  'backbone',
  'countries/views/index/CountryListView'
], function(Backbone, CountryListView) {

  var CountryIndexView = Backbone.View.extend({

    initialize:function() {
      new CountryListView();
    }

  });

  return CountryIndexView;

});
