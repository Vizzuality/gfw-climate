/**
 * The AnalysisResultsPresenter class for the AnalysisResultsView.
 *
 * @return AnalysisResultsPresenter class.
 */
define([
  'map/presenters/PresenterClass',
  'underscore',
  'backbone',
  'moment',
  'mps',
  'helpers/geojsonUtilsHelper'
], function(PresenterClass, _, Backbone, moment, mps, geojsonUtilsHelper) {

  'use strict';

  var StatusModel = Backbone.Model.extend({
    defaults: {
      baselayer: null,
      both: false,
      analysis: false,
      isoTotalArea: null,
      resource: null // analysis resource
    }
  });

  var AnalysisResultsPresenter = PresenterClass.extend({

    /**
     * Layers that support email subscriptions.
     */
    _alertsSubscriptionLayers: [
      'forma'
    ],

    datasets: {
      'biomass_loss': 'biomass-loss',
    },

    init: function(view) {
      this.view = view;
      this.status = new StatusModel();
      this._super();
    },

    /**
     * Application subscriptions.
     */
    _subscriptions: [{
      'Place/go': function(place) {
        this._setBaselayer(place.layerSpec.getBaselayers());
        if ( place.params.subscribe_alerts ) this.subscribeAnalysis();
      }
    }, {
      'LayerNav/change': function(layerSpec) {
        this._setBaselayer(layerSpec.getBaselayers());
      }
    }, {
      'AnalysisService/results': function(results) {
        this._renderResults(results);
      }
    }, {
      'AnalysisResults/totalArea': function(area) {
        this._setTotalArea(area);
      }
    }, {
      'AnalysisTool/iso-drawn': function(multipolygon) {
        var isoTotalArea = geojsonUtilsHelper.getHectares(
          multipolygon);
        this.status.set('isoTotalArea', isoTotalArea);
      }
    }, {
      /**
       * Get the analysis resource so we can
       * get the data for the subscribe button.
       *
       * @param  {Object} resource Analysis resource
       */
      'AnalysisService/get': function(resource) {
        this.status.set('resource', resource);
      }
    }, {
      'AnalysisResults/Delete': function() {
        this.status.set({
          'analysis': false,
          'iso': null,
          'resource': null
        }, { silent: true });
        this.view._deleteAnalysisView();
      }
    },{
      'Analysis/toggle': function() {
        this.view.toogleAnalysis($('#analysis-tab').hasClass('is-analysis'));
      }
    },{
      'DownloadView/create': function(downloadView) {
        this.view.downloadView = downloadView;
      }
    }],

    /**
     * Set the status.baselayer from layerSpec.
     *
     * @param {Object} baselayers Current active baselayers
     */
    _setBaselayer: function(baselayers) {
      var baselayer;

      if (baselayers['loss']) {
        this.loss = true;
        baselayer = baselayers['loss'];
        this.status.set('both', (baselayers['forestgain']) ? true : false);
      }else{
        this.loss = false;
        baselayer = baselayers[_.first(_.intersection(
          _.pluck(baselayers, 'slug'),
          _.keys(this.datasets)))];
      }

      this.status.set('baselayer', baselayer);
    },

    /**
     * Set the subscribe button to disabled if alerts
     * are not supported for the current layers.
     */
    _setSubscribeButton: function() {
      // var supported = false;
      // var baselayer = this.status.get('baselayer');

      // Subscriptions not supported for regions yet.
      // if (baselayer && !this.status.get('resource').id1) {
      //   supported = _.indexOf(this._alertsSubscriptionLayers,
      //     baselayer.slug) >= 0;
      // }

      this.view.toggleSubscribeButton(false);
    },

    /**
     * Handle analysis results from the supplied object.
     *
     * @param  {Object} results [description]
     */
    _renderResults: function(results) {
      // Even if the result is a failure or unavailable message, we render
      // the widget results and keep the polygon.
      this.status.set('analysis', true);
      if (results.unavailable) {
        mps.publish('Spinner/stop');
        this.view.renderFailure();
      } else if (results.failure) {
        mps.publish('Spinner/stop');
        this.view.renderFailure();
      } else {
        mps.publish('Spinner/stop');
        this._renderAnalysis(results);
        // Subscribe button just should be activated
        // when a analysis is succesfully rendered.
        this.view.$tab.addClass('is-analysis');
        mps.publish('Analysis/toggle');
        this._setSubscribeButton();
      }
    },

    /**
     * Render the analysis from the supplied AnalysisService
     * results object.
     *
     * @param  {Object} results Results object form the AnalysisService
     */
    _renderAnalysis: function(results) {
      var layer = this.status.get('baselayer');

      // Unexpected results from successful request
      if (!layer) {
        this._renderResults({failure: true});
        return;
      }

      var params = this._getAnalysisResource(results, layer);
      this.setResults(results);
      this.view.renderAnalysis(params);
      mps.publish('Place/update', [{go: false}]);
    },

    setResults: function(results) {
      this.status.set('results',results);
    },

    /**
     * Updates current analysis if it's permitted.
     */
    _updateAnalysis: function() {
      if (this.status.get('analysis') && !this.status.get('disableUpdating')) {
        mps.publish('AnalysisTool/update-analysis', []);
      }
    },

    /**
     * Render analysis subscribe dialog by publishing
     * to SubscribePresenter.
     */
    subscribeAnalysis: function() {
      var options = {
        analysisResource: this.status.get('resource'),
        layer: this.status.get('baselayer')
      };

      mps.publish('Subscribe/show', [options]);
    },

    /**
     * Delete the current analysis and abort the current
     * AnalysisService request.
     */
    deleteAnalysis: function() {
      this.status.set('analysis', false);
      this.status.set('iso', null);
      this.status.set('resource', null);
      this.view.model.set('boxHidden', true);
      mps.publish('AnalysisService/cancel', []);
      mps.publish('AnalysisResults/delete-analysis', []);
      mps.publish('Place/update', [{go: false}]);
    },


    /**
     * Set total area for countries, protected areas or forest use layers
     */
    _setTotalArea: function(area){
      this.totalArea = area.hectares;
    },

    _getTotalArea: function(){
      return this.totalArea;
    },


    /**
     * Get analysis resource params which are going to be
     * pass to the html to render the analysis results.
     *
     * @param  {Object} results Results object form the AnalysisService
     * @param  {Object} layer   The layer object
     * @return {Object}         Returns resource params
     */

    _getAnalysisResource: function(results, layer) {
      var p = {};
      var params = this.status.attributes.resource;
      var data = results.data.attributes;

      p[layer.slug] = true;
      p.layer = layer;
      p.download = data.download_urls;

      if (p.download) {
        p.download.cdb = (p.download.kml) ? encodeURIComponent(p.download.kml + '&filename=GFW_Analysis_Results') : null;
      }

      if (params.iso) {
        p.iso = params.iso;
      }

      var dateRange = [moment(params.begin),
        moment(params.end)];

      p.dateRange = '{0} to {1}'.format(dateRange[0].format('MMM-YYYY'),
        dateRange[1].format('MMM-YYYY'));

      if (data.areaHa) {
        p.totalArea = data.areaHa;
      }

      /**
       * Tree biomass loss
       */
      if (layer.slug == 'biomass_loss') {
        // Average of the aboveground live biomass
        if (data.biomass) {
          p.averageAbovegroundBiomass = Math.round(data.biomass / parseInt(p.totalArea, 10));
        }

        // Average of carbon stored in aboveground live biomass
        if (p.averageAbovegroundBiomass) {
          p.averageCarbonAbovegroundBiomass = Math.round(p.averageAbovegroundBiomass * 0.5);
        }
      }

      return p;
    },

    roundNumber: function(value){
      return (value < 10) ? value.toFixed(2).toLocaleString() : Math.round(value).toLocaleString();
    },


    showCanopy: function(){
      mps.publish('ThresholdControls/toggle');
    },


  });

  return AnalysisResultsPresenter;

});
