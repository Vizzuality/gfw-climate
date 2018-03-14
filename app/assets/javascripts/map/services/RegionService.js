/**
 * RegionService provides access to information about countries.
 */
define(['Class', 'uri', 'map/services/DataService'], function(
  Class,
  UriTemplate,
  ds
) {
  'use strict';

  var RegionService = Class.extend({
    requestId: 'RegionService',

    _uriTemplate: [
      'http://wri-01.cartodb.com/api/v1/sql?q=',
      'SELECT * FROM gadm28_adm1',
      "where iso='{iso}' AND id_1={id1}",
      '&format=geojson'
    ].join(' '),

    /**
     * Constructs a new instance of RegionService.
     *
     * @return {RegionService} instance
     */
    init: function() {
      this._defineRequests();
    },

    /**
     * The configuration for client side caching of results.
     */
    _cacheConfig: { type: 'persist', duration: 1, unit: 'days' },

    /**
     * Defines requests used by RegionService.
     */
    _defineRequests: function() {
      var cache = this._cacheConfig;
      var config = { cache: cache, url: this._uriTemplate };

      ds.define(this.requestId, config);
    },

    execute: function(data, successCb, failureCb) {
      var config = {
        resourceId: this.requestId,
        data: data,
        success: successCb,
        error: failureCb
      };

      ds.request(config);
    }
  });

  var service = new RegionService();

  return service;
});
