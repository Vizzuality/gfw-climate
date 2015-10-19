define([
  'backbone',
  'countries/presenters/CountryShowPresenter',
  'countries/views/show/CountryShowHeaderView',
  'countries/views/show/TabsView',
  'widgets/views/WidgetGridView'
], function(Backbone, CountryShowPresenter, CountryShowHeaderView,
  TabsView, WidgetGridView, CountryModalView) {

  'use strict';

  var CountryShowView = Backbone.View.extend({

    initialize: function() {
      // Status
      new CountryShowPresenter(this);

      // Children Views
      new CountryShowHeaderView();
      new TabsView();
      new WidgetGridView();
    }

  });

  return CountryShowView;

});
