/**
 * The UMD loass layer presenter.
 *
 * @return UMDLossLayerPresenter class
 */
define(['underscore', 'mps', 'map/presenters/PresenterClass'], function(
  _,
  mps,
  PresenterClass
) {
  'use strict';

  var Forest2000LayerPresenter = PresenterClass.extend({
    init: function(view) {
      this.view = view;
      this._super();
    },

    /**
     * Application subscriptions.
     */
    _subscriptions: [
      {
        'Threshold/changed': function(threshold) {
          this.view.setThreshold(threshold);
        }
      },
      {
        'Uncertainty/changed': function(uncertainty) {
          this.view._updateUncertainty(uncertainty);
        }
      },
      {
        'Range/set': function(range, layer) {
          if (layer === 'carbon_stocks') this.view._updateRange(range);
        }
      }
    ],

    layerRendered: function() {
      mps.publish('Layer/rendered');
    },

    updateLayer: function() {
      mps.publish('Layer/update', [this.view.getName()]);
    }
  });
  return Forest2000LayerPresenter;
});
