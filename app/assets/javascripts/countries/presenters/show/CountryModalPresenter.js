define([
  'mps',
  'countries/presenters/PresenterClass'
], function(mps, PresenterClass) {

  var ReportsPanelPresenter = PresenterClass.extend({

    init: function(view) {
      this._super();
      this.view = view;

      this.status = new (Backbone.Model.extend({
        defaults: {
          view: 'national',
          indicators: null,
          jurisdictions: null,
          areas: null
        }
      }));

      // mps.publish('Place/register', [this]);
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
    }],

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

    _setView: function(view) {
      this.status.set({
        view: view
      });
    }

  });

  return ReportsPanelPresenter;

});
