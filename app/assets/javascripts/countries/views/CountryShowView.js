define([
  'backbone',
  'countries/views/show/FixedHeaderView',
  'countries/views/show/CountryShowHeaderView',
  'countries/views/show/TabsView',
  'countries/views/show/CountryModalView',
  'countries/views/show/WidgetGridView',
  // Common views
  'views/SourceModalView',

], function(Backbone, FixedHeaderView,
  CountryShowHeaderView, TabsView, CountryModalView, WidgetGridView, SourceModalView) {

  'use strict';

  var CountryShowView = Backbone.View.extend({

    initialize: function() {
      new CountryShowHeaderView();
      new CountryModalView();
      new FixedHeaderView();
      new TabsView();
      new WidgetGridView();
      // Common views
      new SourceModalView();
    }

  });

  return CountryShowView;

});
