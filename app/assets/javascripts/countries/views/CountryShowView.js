define([
  'backbone',
  'countries/presenters/CountryShowPresenter',
  'countries/views/show/CountryShowHeaderView',
  'countries/views/show/TabsView',
  'countries/views/show/CountryModalView',
  'countries/views/show/WidgetGridView'
], function(Backbone, CountryShowPresenter, CountryShowHeaderView,
  TabsView, CountryModalView, WidgetGridView) {

  'use strict';

  var CountryShowView = Backbone.View.extend({

    initialize: function() {
      // Status
      new CountryShowPresenter(this);

      // Children Views
      new CountryShowHeaderView();
      new CountryModalView();
      new TabsView();
      new WidgetGridView();
    }

  });

  return CountryShowView;

});
