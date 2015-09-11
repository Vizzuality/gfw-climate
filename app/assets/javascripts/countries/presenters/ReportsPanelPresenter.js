define([
  'mps',
  'countries/presenters/PresenterClass'
], function(mps, PresenterClass) {

  var ReportsPanelPresenter = PresenterClass.extend({

    init: function(view) {
      this._super();
      this.view = view;
    },

    _subscriptions: [{
      'ReportsPanel/open': function() {
        this.view.show();
      }
    }, {
      'ReportsPanel/close': function() {
        this.view.hide();
      }
    }],

    _onSubmitWidgets: function(enabledIndicators) {
      mps.publish('Widgets/render', [enabledIndicators]);
    }

  });

  return ReportsPanelPresenter;

});
