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
  'widgets/views/ShareWidgetView',
  'widgets/views/DownloadWidgetView',
  'views/NotificationsView'
], function(Backbone, FixedHeaderView,
  CountryShowHeaderView, TabsView, CountryWidgetsModalView, WidgetGridView, CountryGridButtonBoxView,
  SourceModalView, ToolbarView, ShareWidgetView, DownloadWidgetView, NotificationsView) {
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
      new ShareWidgetView();
      new DownloadWidgetView();
      new NotificationsView();
    }

  });

  return CountryShowView;

});
