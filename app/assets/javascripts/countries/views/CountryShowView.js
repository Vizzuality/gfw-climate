define([
  'backbone',
  'countries/models/CountryModel',
  'countries/views/show/CountryShowHeaderView',
  'countries/views/show/TabsView',
  'countries/views/show/CountryModalView',
  'countries/views/show/WidgetGridView'
], function(Backbone, CountryModel, CountryShowHeaderView,
  TabsView, CountryModalView, WidgetGridView) {

  'use strict';

  var CountryShowView = Backbone.View.extend({

    initialize: function() {
      new CountryShowHeaderView();
      new CountryModalView();
      new TabsView();
      new WidgetGridView();
    }

  });

  return CountryShowView;

});
