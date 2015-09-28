define([
  'backbone',
  'countries/views/show/CountryShowHeaderView',
  'countries/views/show/TabsView',
  'countries/views/show/WidgetGridView',
  'countries/views/CountryModalView'
], function(Backbone, CountryShowHeaderView,
  TabsView, WidgetGridView, CountryModalView) {

  'use strict';

  var CountryShowView = Backbone.View.extend({

    initialize: function() {
      new CountryShowHeaderView();
      new TabsView();
      new WidgetGridView();
      new CountryModalView();
    }

  });

  return CountryShowView;

});
