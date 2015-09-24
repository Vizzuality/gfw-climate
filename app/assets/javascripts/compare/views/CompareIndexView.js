define([
  'backbone',
  'countries/views/index/CountryListView'
], function(Backbone, CountryListView) {

  var CompareIndexView = Backbone.View.extend({

    initialize:function() {
      new CompareSelectorsView();
    }

  });

  return CompareIndexView;

});
