define([
  'backbone',
  'jquery',
  'countries/models/CountryModel',
  'countries/views/show/CountryShowHeaderView',
  'countries/views/show/WidgetGridView',
  'countries/views/show/CountryIndicatorsView',
  'countries/views/CountryModalView',
], function(Backbone, $, CountryModel, CountryShowHeaderView,
  WidgetGridView, CountryIndicatorsView, CountryModalView) {

  var CountryShowView = Backbone.View.extend({

    initialize: function(arguments) {
      this.model = CountryModel;
      this.model.setCountry(arguments.data);

      var complete = _.invoke([this.model], 'fetch');

      $.when.apply($, complete).done(_.bind(function() {
        new CountryShowHeaderView();
        new WidgetGridView();
        new CountryIndicatorsView();
        new CountryModalView();
      }, this));
    }

  });

  return CountryShowView;

});
