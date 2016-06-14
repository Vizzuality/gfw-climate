/**º
 * The LegendPresenter class for the LegendPresenter view.
 *º
 * @return LegendPresenter class.
 */
define([
  'underscore',
  'backbone',
  'mps',
  'map/presenters/PresenterClass',
  'map/services/LayerSpecService'
], function(_, Backbone, mps, PresenterClass, layerSpecService) {

  'use strict';

  var StatusModel = Backbone.Model.extend({
    defaults: {
      layerSpec: null,
      threshold: null,
      rangearray: null
    }
  });

  var LegendPresenter = PresenterClass.extend({

    init: function(view) {
      this.view = view;
      this.status = new StatusModel();
      mps.publish('Place/register', [this]);
      this._super();
    },

    /**
     * Application subscriptions.
     */
    _subscriptions: [{
      'Place/go': function(place) {
        this.status.set('layerSpec', place.layerSpec);
        this.status.set('threshold', place.params.threshold);
        this.status.set('rangearray', place.params.rangearray);
        this._updateLegend();
        this._toggleSelected();
        this.view.openGFW();
      }
    },{
      'Place/update': function(place) {
        this.view.openGFW();
      }
    }, {
      'LayerNav/change': function(layerSpec) {
        this.status.set('layerSpec', layerSpec);
        this._updateLegend();
        this._toggleSelected();
      }
    }, {
      'AnalysisTool/stop-drawing': function() {
        this.view.model.set({
          hidden: false
        });
      }
    }, {
      'AnalysisTool/start-drawing': function() {
        this.view.model.set({
          hidden: true
        });
      }
    }, {
      'Threshold/changed': function(threshold) {
        this.status.set('threshold', threshold);
        this.status.get('layerSpec') && this._updateLegend();
      }
    }, {
      'LegendMobile/open': function() {
        this.view.toogleLegend();
      }
    }, {
      'Dialogs/close': function() {
        this.view.toogleLegend(false);
      }
    }],

    /**
     * Update legend by calling view.update.
     */
    _updateLegend: function() {
      var categories = this.status.get('layerSpec').getLayersByCategory(),
          options = {
            threshold: this.status.get('threshold'),
            rangearray: this.status.get('rangearray'),
          },
          geographic = !! this.status.get('layerSpec').attributes.geographic_coverage;

      this.view.update(categories, options, geographic);
    },

    /**
     * Toggle selected class sublayers by calling view.toggleSelected.
     */
    _toggleSelected: function() {
      this.view.toggleSelected(this.status.get('layerSpec').getLayers());
    },

    /**
     * Publish a a Map/toggle-layer.
     *
     * @param  {string} layerSlug
     */
    toggleLayer: function(layerSlug) {
      var where = [{slug: layerSlug}];

      layerSpecService.toggle(where,
        _.bind(function(layerSpec) {
          mps.publish('LayerNav/change', [layerSpec]);
          mps.publish('Place/update', [{go: false}]);
        }, this));
    },

    showCanopy: function(){
      mps.publish('ThresholdControls/toggle');
    },

    toggleOverlay: function(to){
      mps.publish('Overlay/toggle', [to])
    },

    initExperiment: function(id){
      mps.publish('Experiment/choose',[id]);
    },

    changeUncertainty: function(el) {
      var type = el.hasOwnProperty('quantity') ? el.quantity : null;
      if (!!type) {
        this.view._setUncertaintyOptionUI(type);
        mps.publish('Uncertainty/changed',[type]);
      }
    },

    setNewRange: function(range,layer) {
      mps.publish('Range/set',[range,layer]);
    },
    _updateRangeArray: function(rangearray,layer) {
      var currentRange = this.status.get('rangearray');
      // overstep key if exists and create new if it does not exist
      if (!!currentRange && !!rangearray) {
        currentRange[Object.keys(rangearray)[0]] = rangearray[layer];
      } else {
        currentRange = rangearray;
      }
      this.status.set('rangearray',currentRange);
      ga('send', 'event', 'Map', 'Settings', 'Range: ' + rangearray);
      this._publishRangeArray();
    },
    _publishRangeArray: function() {
      mps.publish('Place/update', [{go: false}]);
    },
    /**
     * Used by PlaceService to get the current threshold value.
     *
     * @return {Object} threshold
     */
    getPlaceParams: function() {
      var p = {};
      p.rangearray = this.status.get('rangearray');
      return p;
    },

  });

  return LegendPresenter;
});
