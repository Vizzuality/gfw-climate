define([
  'backbone',
  'jquery',
  'countries/models/CountryModel',
  'countries/presenters/ReportsPanelPresenter',
  'countries/views/show/CountryShowHeaderView',
  'countries/views/show/WidgetGridView',
  'countries/views/show/CountryIndicatorsView',
], function(Backbone, $, CountryModel, ReportsPanelPresenter,
    CountryShowHeaderView, WidgetGridView, CountryIndicatorsView) {

  var CountryShowView = Backbone.View.extend({

    initialize: function(arguments) {
      this.model = CountryModel;
      this.model.setCountry(arguments.data);

      this.presenter = ReportsPanelPresenter;

      var complete = _.invoke([this.model], 'fetch');

      $.when.apply($, complete).done(_.bind(function() {
        new CountryShowHeaderView();
        new WidgetGridView();
        new CountryIndicatorsView();
      }, this));
    }

  });

  return CountryShowView;

});
