/**
 * CountryStatsService provides access to information about countries.
 */
define([
  'Class',
  'uri',
  'map/services/DataService'
], function (Class, UriTemplate, ds) {

  'use strict';

  var CountryStatsService = Class.extend({

    requestId: 'CountryStatsService',

    _uriTemplate: 'http://api.resourcewatch.org/query/3f633a05-a3c9-44a5-939c-aecae35fe63e?sql=select * from data where ISO=\'{iso}\'',

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
      var config = {cache: cache, url: this._uriTemplate};

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
