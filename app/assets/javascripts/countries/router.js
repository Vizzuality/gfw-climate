define([
  'backbone',
  'mps',
  'urijs/URI',
  'utils',
  'countries/services/PlaceService',
  'countries/views/CountryIndexView',
  'countries/views/CountryShowView',
  'countries/views/CountryPantropicalView',
  'countries/views/CountryReportView',
  'insights/views/InsightsView'
], function(
  Backbone,
  mps,
  URI,
  utils,
  PlaceService,
  CountryIndexView,
  CountryShowView,
  CountryPantropicalView,
  CountryReportView,
  InsightsView
) {

  'use strict';

  var Router = Backbone.Router.extend({

    params: new (Backbone.Model.extend()),

    routes: {
      'countries'                           : '_initIndex',
      'pantropical'                         : '_initPantropical',
      'insights(/)(:insight)'               : '_initInsights',
      'countries/:country/report'           : '_initReport',
      'countries(/)(:country)(/)(:view)'    : '_initShow'
    },

    initialize: function() {
      this.placeService = new PlaceService(this);

      this.setSubscriptions();
      this.setEvents();
    },

    setSubscriptions: function() {
      mps.subscribe('Router/change', this.setParams.bind(this));
    },

    setEvents: function() {
      this.params.on('change', this.updateUrl, this);
    },

    /**
     * Setting new params and update it
     * @param {Object} params
     */
    setParams: function(params) {
      this.params.clear({ silent: true }).set(params);
    },

    /**
     * Namespace to get current params
     */
    getParams: function() {
      return this.params.attributes;
    },

    /**
     * Change URL with current params
     */
    updateUrl: function() {
      var uri = new URI();
      var params = _.omit(this.getParams(), 'vars', 'defaults','params');
      uri.query(this._serializeParams(params));
      this.navigate(uri.path().slice(1) + uri.search(), { trigger: true });
    },

    /**
     * Transform URL string params to object
     * @param  {String} paramsQuery
     * @return {Object}
     * @example https://medialize.github.io/URI.js/docs.html
     */
    _unserializeParams: function(paramsQuery) {
      var params = {};
      if (typeof paramsQuery === 'string' && paramsQuery.length) {
        var uri = new URI();
        uri.query(paramsQuery);
        params = uri.search(true);
      }
      return params;
    },

    /**
     * Transform object params to URL string
     * @param  {Object} params
     * @return {String}
     * @example https://medialize.github.io/URI.js/docs.html
     */
    _serializeParams: function(params) {
      var uri = new URI();
      uri.search(params);
      return uri.search();
    },

    _initIndex: function() {
      new CountryIndexView();
    },

    _initShow: function(country, view) {

      new CountryShowView();

      var params = _.extend({
        country: country,
        view: view
      }, _.parseUrl());

      this.placeService.initPlace(params);
    },

    _initReport: function(country) {
      var uri = new URI();
      var newParams = uri.search(true);

      this.setParams(newParams);

      new CountryReportView({
        iso: country,
        params: this.getParams() || null
      });
    },

    _initPantropical: function() {
      ga('send', 'event', 'pantropical','Choose visualisation','All countries');
      new CountryPantropicalView();
    },

    _initInsights: function(insight) {
      new InsightsView({
        insight: insight
      });
    },

    // updateUrl: function() {
    //   var current= Backbone.history.getFragment();
    //   this.navigate(current + '?thresh=30');
    // }
  });

  return Router;

});
