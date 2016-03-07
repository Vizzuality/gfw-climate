define([
  'backbone',
  'countries/views/show/FixedHeaderView',
  'countries/views/show/CountryShowHeaderView',
  'countries/views/show/TabsView',
  'countries/views/show/CountryWidgetsModalView',
  'countries/views/show/WidgetGridView',
  'countries/views/show/CountryGridButtonBoxView',
  // Common views
  'views/SourceModalView',
  'views/ToolbarView',

], function(Backbone, FixedHeaderView,
  CountryShowHeaderView, TabsView, CountryWidgetsModalView, WidgetGridView, CountryGridButtonBoxView,
  SourceModalView, ToolbarView) {
  'use strict';

  var CountryShowView = Backbone.View.extend({

    initialize: function() {
      new CountryShowHeaderView();
      new CountryWidgetsModalView();
      new FixedHeaderView();
      new TabsView();
      new WidgetGridView();
      new CountryGridButtonBoxView();
      // Common views
      new SourceModalView();
      new ToolbarView();
    }

  });

  return CountryShowView;

});
