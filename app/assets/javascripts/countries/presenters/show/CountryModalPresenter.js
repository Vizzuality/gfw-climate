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
          indicators: [1, 2],
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

    _onAddIndicator: function(indicator) {
      var currentIndicators = this.status.get('indicators');
      currentIndicators.push(indicator);

      this.status.set({
        indicators: currentIndicators
      });
    },

    _onRemoveIndicator: function(indicator) {
      var currentIndicators = this.status.get('indicators');
      var updatedIndicators = _.without(currentIndicators, indicator);

      this.status.set({
        indicators: updatedIndicators
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
