define([
  'Class',
  'uri',
  'bluebird',
  'map/services/DataService'
], function(Class, UriTemplate, Promise, ds) {

  'use strict';

  var GET_REQUEST_ID = 'ReportService:get';

  var APIURL = window.gfw.config.GFW_API_HOST_NEW_API;

  var APIURLS = {
    'indicator': '/api/indicators/{indicator}{?thresh,iso}'
  };

  var ReportService = Class.extend({

    get: function(status) {
      return new Promise(function(resolve, reject) {
        this.report = status;
        var url = this.getUrl();

        ds.define(GET_REQUEST_ID, {
          cache: false,
          url: url,
          type: 'GET',
          dataType: 'json',
          contentType: 'application/json; charset=utf-8',
          decoder: function ( data, status, xhr, success, error ) {
            if ( status === "success" ) {
              success( data, xhr );
            } else if ( status === "fail" || status === "error" ) {
              error( JSON.parse(xhr.responseText) );
            } else if ( status === "abort") {

            } else {
              error( JSON.parse(xhr.responseText) );
            }
          }
        });

        var requestConfig = {
          resourceId: GET_REQUEST_ID,
          success: function(data, status) {
            resolve(data,status);
          },
          error: function(errors) {
            reject(errors);
          }
        };

        ds.request(requestConfig);

      }.bind(this));
    },

    getUrl: function() {
      return new UriTemplate(APIURLS['indicator']).fillFromObject(this.report);
    }

  });

  return new ReportService();

});
