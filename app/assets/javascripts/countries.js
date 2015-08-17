/**
 * Application entry point.
 */
require([
  'jquery',
  'underscore',
  'Class',
  'backbone',
  '_string',
  'countries/views/CountryListView'
], function($, _, Class, Backbone, _string, CountryListView) {

  'use strict';

  var CountriesPage = Class.extend({

    $el: $('body'),

    init: function() {

      // this._cartodbHack();
      this._initViews();
      this._initApp();

      // // For dev
      // window.router = router;
      // window.mps = mps;
      // window.analysis = AnalysisService;
      // window.countryService = CountryService;
      // window.ds = DataService;
    },

    test: function() {
      debugger;
    },

    /**
     * Initialize the map by starting the history.
     */
    _initApp: function() {
      if (!Backbone.History.started) {
        Backbone.history.start({pushState: true});
      }


    },

    /**
     * Initialize Application Views.
     * CAUTION: Don't change the order of initanciations if
     * you are not completely sure.
     */
    _initViews: function() {
      // Google Experiments
      // new ExperimentsPresenter();
      new CountryListView();

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
