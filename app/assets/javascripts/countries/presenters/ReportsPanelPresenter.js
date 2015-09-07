define([
  'mps',
  'countries/presenters/PresenterClass',
  'countries/views/CountryWindowView'
], function(mps, PresenterClass, CountryWindowView) {

  var ReportsPanelPresenter = PresenterClass.extend({

    init: function(view) {
      this._super();
      this.view = new CountryWindowView ();
    },

    _subscriptions: [{
      'ReportsPanel/open':function() {
        this.view.show();
      }
    }, {
      'ReportsPanel/close': function() {
        this.view.hide();
      }
    }]

  });

  return new ReportsPanelPresenter();

});
