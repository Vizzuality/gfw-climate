define([
  'mps',
  'countries/presenters/PresenterClass'
], function(mps, PresenterClass) {

  var ReportsPanelPresenter = PresenterClass.extend({

    init: function(view) {
      this._super();
      this.view = view;

      this.status = new (Backbone.Model.extend());

      mps.publish('Place/register', [this]);
    },

    _subscriptions: [{
      'Modal/open': function() {
        this.view.show();
      }
    }, {
      'Modal/close': function() {
        this.view.hide();
      }
    }, {
      'Modal/addIndicator': function(indicator) {
        this._onAddIndicator(indicator);
      }
    }, {
      'Modal/removeIndicator': function(indicator) {
        this._onRemoveIndicator(indicator);
      }
    }, {
      'View/update': function(view){
        this._setView(view)
      }
    }, {
      'Place/go': function(params) {
        this._onPlaceGo(params);
      }
    }],

    /**
     * Used by PlaceService to get the current view param.
     *
     * @return {object} iso/area params
     */
    getPlaceParams: function() {
      var p = {};
      return p;
    },

    _onPlaceGo: function(params) {
      this._setView(params.view);
      this._setOptions(params.options);

      this.view.start();
    },

    setIndicators: function(i) {
      this.status.set({
        indicators: i
      });
    },

    setJurisdictions: function(j) {
      this.status.set({
        jurisdictions: j,
      });
    },

    setAreas: function(a) {
      this.status.set({
        areas: a
      });
    },

    _setView: function(v) {
      this.status.set({
        view: v
      });
    },

    _setOptions: function(o) {
      this.status.set({
        options: o
      });
    }

  });

  return ReportsPanelPresenter;

});
