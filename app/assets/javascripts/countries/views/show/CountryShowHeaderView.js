define([
  'backbone',
  'countries/models/CountryModel',
  'countries/presenters/show/CountryHeaderPresenter'
], function(Backbone, CountryModel, CountryHeaderPresenter) {

  var CountryShowHeaderView = Backbone.View.extend({

    el: '#headerCountry',

    events: {
      'click #customizeReports': '_openReportPanel'
    },

    initialize: function(arguments) {
      this.model = CountryModel;
      this.presenter = new CountryHeaderPresenter(this);
    },

    _openReportPanel: function() {
      this.presenter.onOpenReportsPanel();
    }

  });

  return CountryShowHeaderView;

});
