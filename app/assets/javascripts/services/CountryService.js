define([
  'Class',
  'uri',
  'bluebird',
  'map/services/DataService'
], function(Class, UriTemplate, Promise, ds) {

  'use strict';

  var CONFIG = {
    countriesConfigDataset: 'd6b9e0f8-8174-4f84-943d-f4345207d873',
    countryStatsDataset: '3f633a05-a3c9-44a5-939c-aecae35fe63e',
    countriesDataset: '134caa0a-21f7-451d-a7fe-30db31a424aa',
    regionsDataset: '098b33df-6871-4e53-a5ff-b56a7d989f9a',
    subRegionsDataset: 'b3d076cc-b150-4ccb-a93e-eca05d9ac2bf',
  };

  var GET_REQUEST_COUNTRY_CONFIG_ID = 'CountryService:getCountriesConfig',
      GET_REQUEST_COUNTRIES_LIST_ID = 'CountryService:getCountries',
      GET_REQUEST_COUNTRY_STATS_ID = 'CountryService:getCountryStats',
      GET_REQUEST_COUNTRY_ID = 'CountryService:getCountry',
      GET_REQUEST_REGIONS_LIST_ID = 'CountryService:getRegionsList',
      SHOW_REQUEST_REGION_ID = 'CountryService:showRegion';

  var APIURL = window.gfw.config.GFW_API_HOST_PRO;

  var APIURLS = {
    'getClimateConfig'   : '/query?sql=SELECT iso FROM {countriesConfigDataset}',
    'getCountriesList'   : '/query?sql=SELECT name_engli as name, iso FROM {countriesDataset} WHERE iso IN({climateCountries})',
    'getCountriesStats'  : '/query/?sql=SELECT * FROM {countryStatsDataset} WHERE iso=\'{iso}\'',
    'getCountry'         : '/query?sql=SELECT name_engli as name, iso, topojson FROM {countriesDataset} WHERE iso=\'{iso}\'',
    'getRegionsList'     : '/query?sql=SELECT cartodb_id, iso, bbox as bounds, id_1, name_1 FROM {regionsDataset} WHERE iso=\'{iso}\' ORDER BY name_1',
    'showRegion'         : '/query?sql=SELECT id_1, name_1, geojson FROM {regionsDataset} WHERE iso=\'{iso}\' AND id_1={region} ORDER BY name_1',
    'getSubRegionsList'  : '/query?sql=SELECT id_1, name_1 FROM {subRegionsDataset} WHERE iso=\'{iso}\' ORDER BY name_1'
  };

  var CountriesService = Class.extend({
    init: function() {
      this.currentRequest = [];
    },

    getClimateConfig: function(params) {
      return new Promise(function(resolve, reject) {
        var status = _.extend({}, CONFIG, params);
        var url = new UriTemplate(APIURLS.getClimateConfig).fillFromObject(status);

        this.defineRequest(GET_REQUEST_COUNTRY_CONFIG_ID,
          url, { type: 'persist', duration: 1, unit: 'days' });

        var requestConfig = {
          resourceId: GET_REQUEST_COUNTRY_CONFIG_ID,
          success: function(res, status) {
            if (res.data && res.data.length > 0) {
              var climateCountries = res.data && res.data.map(function(country) { return country.iso });
              resolve(climateCountries, status);
            } else {
              reject('There is no climate config countries');
            }
          },
          error: function(errors) {
            reject(errors);
          }
        };

        ds.request(requestConfig);
      }.bind(this));
    },

    getCountries: function() {
      return new Promise(function(resolve, reject) {
        this.getClimateConfig()
          .then(function(countryConfig) {
            var params = { climateCountries: '\'' + countryConfig.join('\',\'') + '\'' };
            var status = _.extend({}, CONFIG, params);
            var url = new UriTemplate(APIURLS.getCountriesList).fillFromObject(status);

            this.defineRequest(GET_REQUEST_COUNTRIES_LIST_ID,
              url, { type: 'persist', duration: 1, unit: 'days' });

            var requestConfig = {
              resourceId: GET_REQUEST_COUNTRIES_LIST_ID,
              success: function(res, status) {
                var data = res.data.length >= 0 ? res.data : [];
                resolve(data, status);
              },
              error: function(errors) {
                reject(errors);
              }
            };

            ds.request(requestConfig);
          }.bind(this))
          .error(function(error) {
            console.warn(error);
          }.bind(this))
      }.bind(this));
    },

    getCountryStats: function(params) {
      return new Promise(function(resolve, reject) {
        this.getClimateConfig()
          .then(function(countryConfig) {
            var url = new UriTemplate(APIURLS.getCountriesStats).fillFromObject(params);

            this.defineRequest(GET_REQUEST_COUNTRY_STATS_ID,
              url, { type: 'persist', duration: 1, unit: 'days' });

            var requestConfig = {
              resourceId: GET_REQUEST_COUNTRY_STATS_ID,
              success: function(res, status) {
                var data = res.data.length >= 0 ? res.data : [];
                resolve(data, status);
              },
              error: function(errors) {
                reject(errors);
              }
            };

            ds.request(requestConfig);
          }.bind(this))
          .error(function(error) {
            console.warn(error);
          }.bind(this))
      }.bind(this));
    },

    getCountry: function(params, stats) {
      stats = stats || false;
      var datasetId = GET_REQUEST_COUNTRY_ID + '_' + params.iso + '_' + stats ? 'withStats' : '';
      if (stats) {
        return new Promise(function(resolve, reject) {
          this.getCountryStats(params)
            .then(function(countryStats) {
              var status = _.extend({}, CONFIG, params);
              var url = new UriTemplate(APIURLS.getCountry).fillFromObject(status);

              this.defineRequest(datasetId,
                url, { type: 'persist', duration: 1, unit: 'days' });

              var requestConfig = {
                resourceId: datasetId,
                success: function(res, status) {
                  var dataCountryStats = countryStats.length >= 0 ? countryStats[0] : [];
                  var dataCountry = res.data.length >= 0 ? res.data[0] : [];
                  var data = _.extend({}, dataCountry, dataCountryStats);
                  resolve(data, status);
                },
                error: function(errors) {
                  reject(errors);
                }
              };

              ds.request(requestConfig);
            }.bind(this))
            .error(function(error) {
              console.warn(error);
            }.bind(this))
        }.bind(this));
      } else {
        return new Promise(function(resolve, reject) {
          var status = _.extend({}, CONFIG, params);
          var url = new UriTemplate(APIURLS.getCountry).fillFromObject(status);

          this.defineRequest(datasetId,
            url, { type: 'persist', duration: 1, unit: 'days' });

          var requestConfig = {
            resourceId: datasetId,
            success: function(res, status) {
              resolve(res.data, status);
            },
            error: function(errors) {
              reject(errors);
            }
          };
        }.bind(this));
      }
    },

    getRegionsList: function(params) {
      return new Promise(function(resolve, reject) {
        var status = _.extend({}, CONFIG, params);
        var url = new UriTemplate(APIURLS.getRegionsList).fillFromObject(status);

        this.defineRequest(GET_REQUEST_REGIONS_LIST_ID,
          url, { type: 'persist', duration: 1, unit: 'days' });

        var requestConfig = {
          resourceId: GET_REQUEST_REGIONS_LIST_ID,
          success: function(res, status) {
            resolve(res.data, status);
          },
          error: function(errors) {
            reject(errors);
          }
        };
      }.bind(this));
    },

    showRegion: function(params) {
      var datasetId = SHOW_REQUEST_REGION_ID + '_' + params.iso + '_' + params.region;
      return new Promise(function(resolve, reject) {
        var status = _.extend({}, CONFIG, params);
        var url = new UriTemplate(APIURLS.showRegion).fillFromObject(status);

        this.defineRequest(datasetId,
          url, { type: 'persist', duration: 1, unit: 'days' });

        var requestConfig = {
          resourceId: datasetId,
          success: function(res, status) {
            var data = res.data.length >= 0 ? res.data[0] : [];
            resolve(data, status);
          },
          error: function(errors) {
            reject(errors);
          }
        };

        ds.request(requestConfig);
      }.bind(this));
    },

    defineRequest: function (id, url, cache) {
      ds.define(id, {
        cache: cache,
        url: APIURL + url,
        type: 'GET',
        dataType: 'json',
        contentType: 'application/json; charset=utf-8',
        decoder: function ( data, status, xhr, success, error ) {
          if ( status === "success" ) {
            success( data, xhr );
          } else if ( status === "fail" || status === "error" ) {
            error(xhr.statusText);
          } else if ( status === "abort") {

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

  return new CountriesService();

});
