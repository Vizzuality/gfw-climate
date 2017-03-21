/**
 * CountryStatsService provides access to information about countries.
 */
define([
  'Class',
  'uri',
  'map/services/DataService'
], function (Class, UriTemplate, ds) {

  'use strict';

  var COUNTRIES_DATASET_STATS_ID= '3f633a05-a3c9-44a5-939c-aecae35fe63e';

  var CountryStatsService = Class.extend({

    requestId: 'CountryStatsService',

    _uriTemplate: '/query/?sql=SELECT * FROM ' + COUNTRIES_DATASET_STATS_ID + ' WHERE iso=\'{iso}\'',

    /**
     * Constructs a new instance of CountryStatsService.
     *
     * @return {CountryStatsService} instance
     */
    init: function() {
      this._defineRequests();
    },

    /**
     * The configuration for client side caching of results.
     */
    _cacheConfig: {type: 'persist', duration: 1, unit: 'days'},

    /**
     * Defines requests used by CountryStatsService.
     */
    _defineRequests: function() {
      // var cache = this._cacheConfig;
      var cache = false;
      var config = {cache: cache, url:  window.gfw.config.GFW_API_HOST_V2 + this._uriTemplate};

      ds.define(this.requestId, config);
    },

    execute: function(iso, successCb, failureCb) {
      var config = {resourceId: this.requestId, data: {iso: iso},
        success: successCb, error: failureCb};

      ds.request(config);
    }
  });

  var service = new CountryStatsService();

  return service;
});
