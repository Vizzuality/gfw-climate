define(
  ['Class', 'uri', 'underscore', 'bluebird', 'map/services/DataService'],
  function(Class, UriTemplate, _, Promise, ds) {
    'use strict';

    var CONFIG = {
      continentsDataset: '986e3e6c-7002-4ea3-aa8f-32244e882c57'
    };

    var GET_REQUEST_CONTINENTS_LIST_ID = 'ContinentsService:getContinents';

    var APIURL = window.gfw.config.GFW_API_HOST_PRO;

    var APIURLS = {
      getContinentsList:
        '/query?sql=SELECT continent FROM {continentsDataset} where climate=true',
      getContinentsListGeo:
        '/query?sql=SELECT topojson, continent FROM {continentsDataset} where climate=true'
    };

    var ContinentsService = Class.extend({
      init: function() {
        this.currentRequest = [];
      },

      getContinents: function(options) {
        var filters = options || {
          geo: false
        };
        return new Promise(
          function(resolve, reject) {
            var params = {};
            var queryData = _.extend({}, CONFIG, params);
            var urlTemplate = filters.geo
              ? APIURLS.getContinentsListGeo
              : APIURLS.getContinentsList;
            var templateId = filters.geo
              ? GET_REQUEST_CONTINENTS_LIST_ID + '_GEO'
              : GET_REQUEST_CONTINENTS_LIST_ID;
            var url = new UriTemplate(urlTemplate).fillFromObject(queryData);

            this.defineRequest(templateId, url, {
              type: 'persist',
              duration: 10,
              unit: 'days'
            });
            var requestConfig = {
              resourceId: templateId,
              success: function(res, status) {
                var data = res.data.length >= 0 ? res.data : [];
                if (filters.geo) {
                  var dataParsed = data.map(function(continent) {
                    return {
                      name: continent.continent,
                      iso: continent.continent.split(' ').join('-'),
                      topojson: continent.topojson
                    };
                  });
                  resolve(dataParsed, status);
                } else {
                  resolve(data, status);
                }
              },
              error: function(errors) {
                reject(errors);
              }
            };

            ds.request(requestConfig);
          }.bind(this)
        );
      },

      defineRequest: function(id, url, cache) {
        ds.define(id, {
          cache: cache,
          url: APIURL + url,
          type: 'GET',
          dataType: 'json',
          'Content-Type': 'application/json; charset=utf-8',
          decoder: function(data, status, xhr, success, error) {
            if (status === 'success') {
              success(data, xhr);
            } else if (status === 'fail' || status === 'error') {
              error(xhr.statusText);
            } else if (status === 'abort') {
              console.warn('aborted');
            } else {
              error(xhr.statusText);
            }
          }
        });
      },

      /**
       * Abort the current request if it exists.
       */
      abortRequest: function(request) {
        if (this.currentRequest && this.currentRequest[request]) {
          this.currentRequest[request].abort();
          this.currentRequest[request] = null;
        }
      }
    });

    return new ContinentsService();
  }
);
