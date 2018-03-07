define([
  'Class', 'uri', 'bluebird',
  'map/services/DataService'
], function(Class, UriTemplate, Promise, ds) {

  'use strict';

  var GET_REQUEST_ID = 'GeostoreService:get',
      SAVE_REQUEST_ID = 'GeostoreService:save';

  var URL = window.gfw.config.GFW_API_HOST_V2 + '/geostore/{id}';

  var GeostoreService = Class.extend({

    get: function(id) {
      return new Promise(function(resolve, reject) {

        var url = new UriTemplate(URL).fillFromObject({id: id});

        ds.define(GET_REQUEST_ID, {
          cache: {type: 'persist', duration: 1, unit: 'days'},
          url: url,
          type: 'GET'
        });

        var requestConfig = {
          resourceId: GET_REQUEST_ID,
          success: resolve
        };

        ds.request(requestConfig);

      });
    },

    save: function(geojson, timeout) {
      return new Promise(function(resolve, reject) {

        var url = new UriTemplate(URL).fillFromObject({});

        ds.define(SAVE_REQUEST_ID, {
          url: url,
          type: 'POST',
          contentType: 'application/json'
        });

        var requestConfig = {
          resourceId: SAVE_REQUEST_ID,
          data: JSON.stringify({
            geojson: geojson,
          }),
          success: function(response) {
            resolve(response.data.attributes.hash);
          },
          error: reject
        };

        ds.request(requestConfig);

      }).timeout(timeout || 15000);
    },

    use: function(provider) {
      return new Promise(function(resolve, reject) {

        var url = new UriTemplate(URL).fillFromObject({});

        ds.define(SAVE_REQUEST_ID, {
          cache: false,
          url: url,
          type: 'POST',
          dataType: 'json',
          contentType: 'application/json; charset=utf-8'
        });

        var requestConfig = {
          resourceId: SAVE_REQUEST_ID,
          data: JSON.stringify({
            provider: provider
          }),
          success: function(response) {
            resolve(response.data.id);
          },
          error: reject
        };

        ds.request(requestConfig);

      });
    }

  });

  return new GeostoreService();

});
