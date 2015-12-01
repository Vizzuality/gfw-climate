/**
 * The AnalysisService module for interacting with the GFW Analysis API.
 *
 * To use this service, you can inject it directly and call the execute()
 * function. The preferred way is to use events to keep the app decoupled
 * and testable.
 *
 * To do analysis with events, first subscribe:
 *
 *   mps.subscribe('AnalysisService/results', function(results) {...});
 *
 * Then you can do an analysis by publishing:
 *
 *   mps.publish('AnalysisService/get', [config]);
 *
 *  See the execute() function docs for information about the config,
 *  success, and failure arguments.
 */
define([
  'underscore',
  'Class',
  'map/services/DataService',
  'mps',
  '_string'
], function (_, Class, ds, mps) {

  'use strict';

  var URL = window.gfw.config.GFW_API_HOST + '/forest-change';
  //var URL = 'http://localhost:8080/forest-change';


  var AnalysisService = Class.extend({

    /**
     * Constructs a new instance of AnalysisService.
     *
     * @return {AnalysisService} instance
     */
    init: function() {
      this._defineRequests();
      this._subscribe();
      this._currentRequest = null;
    },

    /**
     * Asynchronously execute analysis for supplied configuration.
     *
     * @param  {Object} config object
     *   dataset - layer name (e.g., forma-alerts, umd-loss-gain)
     *   period - beginyear,endyear (e.g., 2001,2002)
     *   download - filename.format (e.g., forma.shp)
     *   geojson - GeoJSON Polygon or Multipolygon
     *   iso - 3 letter country ISO code (e.g., BRA)
     *   id1 - GADM subational id (e.g., 3445)
     *   use - Concession name (e.g., logging, mining, oilpalm, fiber)
     *   useid - Concession polygon cartodb_id (e.g., 2)
     *   wdpaid - WDPA polygon cartodb_id (e.g., 800)
     */
    execute: function(data, successCb, failureCb) {
      var id = this._getId(data);
      var success = _.bind(function(results) {
        mps.publish('AnalysisService/results', [results]);
        if (successCb) {
          successCb(results);
        }
      }, this);

      var failure = _.bind(function(t, a) {
        if (a === 'abort') {return;}
        // var results = {failure: a};
        // Remove this
        var results = {"apis": {"ifl_national": "http://localhost:8080/biomass-loss/admin/ifl/{/iso}{?bust,dev,thresh}", "ifl_subnational": "http://localhost:8080/biomass-loss/admin/ifl/{/iso}{/id1}{?bust,dev,thresh}", "national": "http://localhost:8080/biomass-loss/admin{/iso}{?bust,dev,thresh}", "subnational": "http://localhost:8080/biomass-loss/admin{/iso}{/id1}{?bust,dev,thresh}"}, "meta": {"coverage": "", "description": "Identifies areas of biomass loss", "id": "biomass-loss", "name": "", "resolution": "30 x 30 meters", "source": "Landsat 7 ETM+", "timescale": "January 2000-2014", "units": "Biomass: Mg, Biomass loss: Mg biomass", "updates": "Loss: Annual, Gain: 12-year cumulative, updated                 annually"}, "params": {"begin": "2012-01-01", "end": "2015-01-01", "id1": "1", "iso": "bra", "thresh": 10}, "years": [{"admin0_name": "Brazil", "boundary": "admin", "id1": 1, "indicator_id": 4, "iso": "BRA", "thresh": 10, "value": 3663.327595, "year": 0}, {"admin0_name": "Brazil", "boundary": "admin", "id1": 1, "indicator_id": 12, "iso": "BRA", "thresh": 10, "value": 3142.190211, "year": 0}, {"admin0_name": "Brazil", "boundary": "admin", "id1": 1, "indicator_id": 12, "iso": "BRA", "thresh": 10, "value": 12.35020454, "year": 2001}, {"admin0_name": "Brazil", "boundary": "admin", "id1": 1, "indicator_id": 12, "iso": "BRA", "thresh": 10, "value": 14.06061915, "year": 2002}, {"admin0_name": "Brazil", "boundary": "admin", "id1": 1, "indicator_id": 12, "iso": "BRA", "thresh": 10, "value": 7.617328353, "year": 2003}, {"admin0_name": "Brazil", "boundary": "admin", "id1": 1, "indicator_id": 12, "iso": "BRA", "thresh": 10, "value": 13.93449072, "year": 2004}, {"admin0_name": "Brazil", "boundary": "admin", "id1": 1, "indicator_id": 12, "iso": "BRA", "thresh": 10, "value": 33.51633577, "year": 2005}, {"admin0_name": "Brazil", "boundary": "admin", "id1": 1, "indicator_id": 12, "iso": "BRA", "thresh": 10, "value": 8.551910836, "year": 2006}, {"admin0_name": "Brazil", "boundary": "admin", "id1": 1, "indicator_id": 12, "iso": "BRA", "thresh": 10, "value": 7.604036179, "year": 2007}, {"admin0_name": "Brazil", "boundary": "admin", "id1": 1, "indicator_id": 12, "iso": "BRA", "thresh": 10, "value": 11.64711393, "year": 2008}, {"admin0_name": "Brazil", "boundary": "admin", "id1": 1, "indicator_id": 12, "iso": "BRA", "thresh": 10, "value": 7.668414644, "year": 2009}, {"admin0_name": "Brazil", "boundary": "admin", "id1": 1, "indicator_id": 12, "iso": "BRA", "thresh": 10, "value": 8.85747759, "year": 2010}, {"admin0_name": "Brazil", "boundary": "admin", "id1": 1, "indicator_id": 12, "iso": "BRA", "thresh": 10, "value": 8.380695386, "year": 2011}, {"admin0_name": "Brazil", "boundary": "admin", "id1": 1, "indicator_id": 12, "iso": "BRA", "thresh": 10, "value": 13.60393228, "year": 2012}, {"admin0_name": "Brazil", "boundary": "admin", "id1": 1, "indicator_id": 12, "iso": "BRA", "thresh": 10, "value": 10.502979, "year": 2013}, {"admin0_name": "Brazil", "boundary": "admin", "id1": 1, "indicator_id": 12, "iso": "BRA", "thresh": 10, "value": 12.52428626, "year": 2014}]};
        mps.publish('AnalysisService/results', [results]);
        if (failureCb) {
          // Remove this
          successCb(results);
          // failureCb(results);
        }
      }, this);

      var config = {
        resourceId: id,
        data: data,
        success: success,
        error: failure
      };

      this._abortRequest();
      this._currentRequest = ds.request(config);
    },

    /**
     * The configuration for client side caching of results.
     */
    _cacheConfig: {type: 'persist', duration: 1, unit: 'days'},

    /**
     * Defines all API requests used by AnalysisService.
     */
    _defineRequests: function() {
      var datasets = [
        'biomass-loss'
      ];

      // Defines requests for each dataset (e.g., forma-alerts) and type (e.g.
      // national)
      _.each(datasets, function(dataset) {
        _.each(this._urls(dataset), function(url, id) {
          var cache = this._cacheConfig;
          var config = {
            cache: cache, url: url, type: 'POST',
            dataType: 'json'};
          ds.define(id, config);
        }, this);
      }, this);
    },

    /**
     * Subscribes to the 'AnalysisService/get' topic.
     */
    _subscribe: function() {
      mps.subscribe('AnalysisService/get', _.bind(function(config) {
        this.execute(config);
      }, this));

      mps.subscribe('AnalysisService/cancel', _.bind(function() {
        this._abortRequest();
      }, this));
    },

    /**
     * Returns analysis API urls for supplied dataset.
     *
     * @param  {string} dataset The dataset
     * @return {object} Object with ids mapping to urls
     */
    _urls: function(dataset) {
      var types = ['world', 'national', 'subnational', 'use', 'wdpa'];
      var params = {'umd-loss-gain': '{thresh}'}[dataset] || '';
      var ids = _.map(types,
        function(type) {
          return  _.str.sprintf('%s:%s', dataset, type);
        });

      var urls = [
        _.str.sprintf('%s/%s%s', URL, dataset, params),
        _.str.sprintf('%s/%s/admin/{iso}%s', URL, dataset, params),
        _.str.sprintf('%s/%s/admin/{iso}/{id1}%s', URL, dataset, params),
        _.str.sprintf('%s/%s/use/{use}/{useid}%s', URL, dataset, params),
        _.str.sprintf('%s/%s/wdpa/{wdpaid}%s', URL, dataset, params)
      ];
      return _.object(ids, urls);
    },


    /**
     * Returns the request id dataset:type for supplied request config.
     *
     * @param  {object} config The request config object.
     * @return {[type]} The request id
     */
    _getId: function(config) {
      var dataset = config.dataset;

      if (!dataset) {
        return null;
      }

      if (_.has(config, 'iso') && !_.has(config, 'id1')) {
        return _.str.sprintf('%s:national', dataset);
      } else if (_.has(config, 'iso') && _.has(config, 'id1')) {
        return _.str.sprintf('%s:subnational', dataset);
      } else if (_.has(config, 'use')) {
        return _.str.sprintf('%s:use', dataset);
      } else if (_.has(config, 'wdpaid')) {
        return _.str.sprintf('%s:wdpa', dataset);
      } else if (_.has(config, 'geojson')) {
        return _.str.sprintf('%s:world', dataset);
      }

      return null;
    },

    /**
     * Abort the current request if it exists.
     */
    _abortRequest: function() {
      this._currentRequest && this._currentRequest.abort();
      this._currentRequest = null;
    }
  });

  var service = new AnalysisService();

  return service;
});
