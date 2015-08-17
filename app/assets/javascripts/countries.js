/**
 * Application entry point.
 */
require([
  'jquery',
  'underscore',
  'Class',
  'backbone',
  '_string',
  'countries/router'
], function($, _, Class, Backbone, _string, RouterView) {

  'use strict';

  var CountriesPage = Backbone.View.extend({

    el: document.body,

    initialize: function() {
      this._initApp();
      this._initRouter();
    },

    /**
     * Initialize the map by starting the history.
     */
    _initApp: function() {
      if (!Backbone.History.started) {
        Backbone.history.start({pushState: true});
      }
    },

    _initRouter: function() {
      this.router = new RouterView();
    },

    /**
     * Initialize Application Views.
     * CAUTION: Don't change the order of initanciations if
     * you are not completely sure.
     */
    _initViews: function() {
      // Google Experiments
      // new ExperimentsPresenter();
      // new CountryListView();

      // var mapView = new MapView();

      // new MapControlsView(mapView.map);
      // new TabsView(mapView.map);
      // new AnalysisResultsView();
      // new LayersNavView();
      // new LegendView();
      // new TimelineView();
      // new NavMobileView();
      // new FooterView();
      // new HeaderView();
      // new SourceWindowView();
      // new SourceMobileFriendlyView();
      // new NotificationsView();
    }

  });

  new CountriesPage();

});
