/**
 * The LayersNavPresenter class for the LayersNavView.
 *
 * @return LayersNavPresenter class.
 */
define(
  [
    'underscore',
    'mps',
    'map/presenters/PresenterClass',
    'map/services/LayerSpecService'
  ],
  function(_, mps, PresenterClass, layerSpecService) {
    'use strict';

    var LayersNavPresenter = PresenterClass.extend({
      init: function(view) {
        this.view = view;
        this._super();
      },

      /**
       * Application subscriptions.
       */
      _subscriptions: [
        {
          'Place/go': function(place) {
            this.view._toggleSelected(place.layerSpec.getLayers());
            place.params.iso ? this.view.setIso(place.params.iso) : null;
          }
        },
        {
          'LayerNav/change': function(layerSpec) {
            this.view._toggleSelected(layerSpec.getLayers());
          }
        },
        {
          'Layers/isos': function(layers_iso) {
            this.view._getIsoLayers(layers_iso);
          }
        },
        {
          'LocalMode/updateIso': function(iso) {
            this.view.updateIso(iso);
          }
        },
        {
          'AnalysisResults/delete-analysis': function() {
            var iso = { country: null, region: null };
            this.view.updateIso(iso);
          }
        }
      ],

      initExperiment: function(id) {
        mps.publish('Experiment/choose', [id]);
      },

      notificate: function(id) {
        mps.publish('Notification/open', [id]);
      },

      resetIso: function() {
        mps.publish('Countries/changeIso', [
          { country: null, region: null },
          false
        ]);
      },

      /**
       * Publish a a Map/toggle-layer.
       *
       * @param  {string} layerSlug
       */
      toggleLayer: function(layerSlug) {
        var where = [{ slug: layerSlug }];

        layerSpecService.toggle(
          where,
          _.bind(function(layerSpec) {
            mps.publish('LayerNav/change', [layerSpec]);
            mps.publish('Place/update', [{ go: false }]);
          }, this)
        );
      }
    });

    return LayersNavPresenter;
  }
);
