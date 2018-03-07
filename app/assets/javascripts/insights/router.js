define(
  [
    'backbone',
    'underscore',
    'mps',
    'urijs/URI',
    'utils',
    'countries/services/PlaceService',
    'insights/views/glad-alerts/InsightsGladAlertsView',
    'insights/views/emissions-calculator/EmissionCalculatorIndexView'
  ],
  function(
    Backbone,
    _,
    mps,
    URI,
    utils,
    PlaceService,
    InsightsGladAlertsView,
    EmissionCalculatorIndexView
  ) {
    'use strict';

    var Router = Backbone.Router.extend({
      params: new (Backbone.Model.extend())(),

      routes: {
        'insights/glad-alerts(/:iso)': '_initGladAlerts',
        'insights/emissions-calculator': '_initEmissionsCalculatorIndex',
        'insights/emissions-calculator/:id': '_initEmissionsCalculatorShow'
      },

      initialize: function() {
        this.placeService = new PlaceService(this);

        this.setSubscriptions();
        this.setEvents();
      },

      setSubscriptions: function() {
        mps.subscribe('Router/change', this.setParams.bind(this));
        mps.subscribe('Router/goInsight', this.updateInsight.bind(this));
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
        var params = _.omit(this.getParams(), 'vars', 'defaults', 'params');
        uri.query(this._serializeParams(params));
        // {replace: true} update the URL without creating an entry in the browser's history and allow us to go back
        this.navigate(uri.path().slice(1) + uri.search(), {
          trigger: true,
          replace: true
        });
      },

      /**
       * Update the country insight
       */
      updateInsight: function(iso) {
        this.navigate('/insights/' + this.insight + '/' + iso, {
          trigger: false
        });
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

      _initGladAlerts: function(iso) {
        this.iso = iso;
        this.insight = 'glad-alerts';

        new InsightsGladAlertsView({
          country: this.iso
        });
      },

      _initEmissionsCalculatorIndex: function() {
        this.insight = 'emissions-calculator';
        new EmissionCalculatorIndexView();
      }
    });

    return Router;
  }
);
