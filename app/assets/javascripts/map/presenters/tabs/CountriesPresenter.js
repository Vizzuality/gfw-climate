/**
 * The CountriesPresenter class for the CountriesPresenter view.
 *
 * @return CountriesPresenter class.
 */
define(
  [
    'underscore',
    'mps',
    'map/presenters/PresenterClass',
    'map/services/TreeLossCarbonEmissionsService'
  ],
  function(_, mps, PresenterClass, treeLossCarbonEmissionsService) {
    'use strict';

    var StatusModel = Backbone.Model.extend({
      defaults: {
        iso: null,
        dont_analyze: true
      }
    });

    var CountriesPresenter = PresenterClass.extend({
      init: function(view) {
        this.view = view;
        this._super();
        this.status = new StatusModel();
        mps.publish('Place/register', [this]);
      },

      /**
       * Application subscriptions.
       */
      _subscriptions: [
        {
          'Place/go': function(place) {
            this._handlePlaceGo(place.params);
          }
        },
        {
          'LocalMode/updateIso': function(iso) {
            this.status.set('iso', iso);
            if (!iso.country) {
              mps.publish('Place/update', [{ go: false }]);
            }
            this.view.setSelects(iso);
          }
        },
        {
          'LayerNav/change': function(layerSpec) {
            this.view._renderHtml();
          }
        },
        {
          'Layers/isos': function(layers_iso) {
            this.view.getIsoLayers(layers_iso);
          }
        },
        {
          'AnalysisResults/delete-analysis': function() {
            this.changeIso({ country: null, area: null });
          }
        },
        {
          'Analysis/analyze-iso': function(iso, to) {
            this.status.set('iso', iso);
            this.setAnalyze(to);
          }
        },
        {
          'DownloadView/create': function(downloadView) {
            this.view.downloadView = downloadView;
          }
        },
        {
          'Countries/changeIso': function(iso, analyze) {
            this.status.set('dont_analyze', analyze);
            if (!!iso.country) {
              // this._fetchTreeLoosCarbonEmissionsData(iso);
            }
          }
        }
      ],

      _handlePlaceGo: function(params) {
        if (params.dont_analyze) {
          this.status.set('dont_analyze', true);
        } else {
          this.status.set('dont_analyze', null);
        }
        if (params.iso.country && params.iso.country !== 'ALL') {
          this.status.set('iso', params.iso);
          this.view.setSelects(params.iso);
        }
      },
      /**
       * Used by PlaceService to get the current threshold value.
       *
       * @return {Object} threshold
       */

      getPlaceParams: function() {
        var p = {};
        p.iso = this.status.get('iso');
        p.dont_analyze = this.status.get('dont_analyze');
        return p;
      },

      setAnalyze: function(to) {
        this.status.set('dont_analyze', to);
        mps.publish('Place/update', [{ go: false }]);
        mps.publish('Countries/changeIso', [
          this.status.get('iso'),
          this.status.get('dont_analyze')
        ]);
      },

      changeIso: function(iso) {
        this.status.set('iso', iso);
        this.status.set('dont_analyze', true);
        mps.publish('Place/update', [{ go: false }]);
        mps.publish('Countries/changeIso', [
          iso,
          this.status.get('dont_analyze')
        ]);
      },

      changeNameIso: function(name) {
        mps.publish('Countries/name', [name, !!name]);
      },

      openTab: function(id) {
        mps.publish('Tab/open', [id]);
      },

      initExperiment: function(id) {
        mps.publish('Experiment/choose', [id]);
      }
    });

    return CountriesPresenter;
  }
);
