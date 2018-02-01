/**
 * Aysynchronous service for accessing map layer metadata.
 *
 */
define(
  ['Class', 'mps', 'map/services/DataService', 'uri', 'underscore'],
  function(Class, mps, ds, UriTemplate, _) {
    'use strict';

    var MapLayerService = Class.extend({
      requestId: 'MapLayerService:getLayers',

      /**
       * Constructs a new instance of MapLayerService.
       *
       * @return {MapLayerService} instance
       */
      init: function() {
        // this.layers = null;
        this._defineRequests();
      },

      /**
       * The configuration for client side caching of results.
       */
      _cacheConfig: { type: 'persist', duration: 1, unit: 'days' },

      /**
       * Defines CartoDB requests used by MapLayerService.
       */
      _defineRequests: function() {
        var cache = this._cacheConfig;
        var url = this._getUrl();
        var config = {
          cache: cache,
          url: url,
          type: 'POST',
          dataType: 'jsonp'
        };
        ds.define(this.requestId, config);
      },

      /**
       * Asynchronously get layers for supplied array of where specs.
       *
       * @param  {array} where Where objects (e.g., [{id: 123}, {slug: 'loss'}])
       * @param  {function} successCb Function that takes the layers if found.
       * @param  {function} errorCb Function that takes an error if on occurred.
       */
      getLayers: function(where, successCb, errorCb) {
        this._fetchLayers(
          _.bind(function(layers) {
            // filter iso layers and pack them, then send the package to the presenter
            mps.publish('Layers/isos', [
              _.filter(layers.rows, function(lay) {
                return lay.iso !== null;
              })
            ]);

            var hits = _.map(where, _.partial(_.where, layers.rows));
            successCb(
              _.uniq(_.flatten(hits), function(h) {
                return h.id;
              })
            );
          }, this),
          _.bind(function(error) {
            errorCb(error);
          }, this)
        );
      },

      _getUrl: function() {
        var template = null;
        var sql = null;

        if (!this.url) {
          template = 'http://wri-01.cartodb.com/api/v2/sql{?q}';
          /* eslint-disable-block */
          sql =
            'SELECT \
                cartodb_id AS id, \
                slug, \
                title, \
                title_color, \
                subtitle, \
                sublayer, \
                table_name, \
                source, \
                source_json, \
                category_color, \
                category_slug, \
                category_name, \
                external, \
                iso, \
                zmin, \
                zmax, \
                mindate, \
                maxdate, \
                fit_to_geom, \
                extent, \
                tileurl, \
                does_wrapper, \
                true AS visible \
              FROM \
                ' +
            window.gfw.layer_spec +
            " \
              WHERE \
                display = 'true' \
              ORDER BY \
                displaylayer, \
                title ASC";
          this.url = new UriTemplate(template).fillFromObject({ q: sql });
        }

        return this.url;
      },

      _fetchLayers: function(successCb, errorCb) {
        var config = {
          resourceId: this.requestId,
          success: successCb,
          error: errorCb
        };

        ds.request(config);
      }
    });

    var service = new MapLayerService();

    return service;
  }
);
