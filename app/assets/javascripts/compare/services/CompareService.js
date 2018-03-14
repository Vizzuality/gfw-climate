/**
 * CompareService provides access to information about countries.
 */
define(['Class', 'uri', 'map/services/DataService'], function(
  Class,
  UriTemplate,
  ds
) {
  'use strict';

  var CompareService = Class.extend({
    requestId: 'CompareService',

    _uriTemplate: '/api/compare-countries/{compare1}/{compare2}',

    /**
     * Constructs a new instance of CompareService.
     *
     * @return {CompareService} instance
     */
    init: function() {
      this._defineRequests();
    },

    /**
     * The configuration for client side caching of results.
     */
    _cacheConfig: { type: 'persist', duration: 1, unit: 'days' },

    /**
     * Defines requests used by CompareService.
     */
    _defineRequests: function() {
      // var cache = this._cacheConfig;
      var cache = false;
      var config = { cache: cache, url: this._uriTemplate };

      ds.define(this.requestId, config);
    },

    execute: function(compare1, compare2, successCb, failureCb) {
      var config = {
        resourceId: this.requestId,
        data: { compare1: compare1, compare2: compare2 },
        success: successCb,
        error: failureCb
      };

      ds.request(config);
    }
  });

  var service = new CompareService();

  return service;
});
