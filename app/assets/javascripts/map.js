/**
 * Application entry point.
 */
require([
  'jquery',
  'underscore',
  'Class',
  'backbone',
  'chosen',
  'map/utils',
  'enquire',
  'mps',
  'map/router',
  'views/SourceModalView',
  'views/SourceMobileFriendlyView',
  'map/services/AnalysisService',
  'map/services/DataService',
  'map/views/MapView',
  'map/views/MapControlsView',
  'map/views/TabsView',
  'map/views/analysis/AnalysisResultsView',
  'map/views/LayersNavView',
  'map/views/LegendView',
  'map/views/TimelineView',
  'map/views/NavMobileView',
  'views/HeaderView',
  'views/FooterView',
  'views/NotificationsView',
  'views/DownloadView',

  '_string'
], function(
  $,
  _,
  Class,
  Backbone,
  chosen,
  utils,
  enquire,
  mps,
  Router,
  SourceModalView,
  SourceMobileFriendlyView,
  AnalysisService,
  DataService,
  MapView,
  MapControlsView,
  TabsView,
  AnalysisResultsView,
  LayersNavView,
  LegendView,
  TimelineView,
  NavMobileView,
  HeaderView,
  FooterView,
  NotificationsView,
  DownloadView
) {
  'use strict';

  var MapPage = Class.extend({
    $el: $('body'),

    init: function() {
      var router = new Router(this);
      this._cartodbHack();
      this._initViews();
      this._initApp();

      // For dev
      window.router = router;
      window.mps = mps;
      window.analysis = AnalysisService;
      window.ds = DataService;
    },

    /**
     * Initialize the map by starting the history.
     */
    _initApp: function() {
      if (!Backbone.History.started) {
        Backbone.history.start({ pushState: true });
      }
    },

    /**
     * Initialize Application Views.
     * CAUTION: Don't change the order of initanciations if
     * you are not completely sure.
     */
    _initViews: function() {
      var mapView = new MapView();

      new MapControlsView(mapView.map);
      new TabsView(mapView.map);
      new AnalysisResultsView();
      new LayersNavView();
      new LegendView();
      new TimelineView();
      new NavMobileView();
      new FooterView();
      new HeaderView();
      new SourceModalView();
      new SourceMobileFriendlyView();
      new NotificationsView();
    },

    /**
     * Cartodb Handlebars hack.
     */
    _cartodbHack: function() {
      cdb.core.Template.compilers = _.extend(cdb.core.Template.compilers, {
        handlebars:
          typeof Handlebars === 'undefined' ? null : Handlebars.compile
      });
    }
  });

  new MapPage();
});
