define([
  'backbone',
  'mps',
  'countries/presenters/show/WidgetGridPresenter',
  'widgets/views/WidgetView',
  'countries/views/show/reports/NationalView',
  'countries/views/show/reports/SubNationalView',
  'countries/views/show/reports/AreasView',
], function(Backbone, mps, WidgetGridPresenter, WidgetView, NationalView,
    SubNationalView, AreasView) {

  'use strict';

  var CountryWidgetsView = Backbone.View.extend({

    el: '#reports',

    events: {
      'click .addIndicators' : '_showModal'
    },

    initialize: function() {
      this.presenter = new WidgetGridPresenter(this);
      this._cacheVars();
    },

    start: function() {
      this.render();
    },

    _cacheVars: function() {
      this.$moreIndicatorsWarning = $('.more-indicators-warning');
      this.$noIndicatorsWarning = $('.no-indicators-warning');
    },

    _toggleWarnings: function() {
      var widgets = this.presenter.status.get('options')['widgets'];

      if (_.keys(widgets).length > 0) {
        this.$noIndicatorsWarning.addClass('is-hidden');
        this.$moreIndicatorsWarning.removeClass('is-hidden');
      } else {
        this.$moreIndicatorsWarning.addClass('is-hidden');
      }
    },

    _showModal: function(e) {
      e && e.preventDefault();
      mps.publish('Modal/open', [this.presenter.status.get('view')]);
    },

    render: function() {

      var view = this.presenter.status.get('view');
      var options = {
        country: this.presenter.status.get('country'),
        parent: this.$el.find('.reports-grid')
      };

      switch(view) {

        case 'national':
          _.extend(options, {
            status: this.presenter.status.get('options')
          });

          new NationalView(options);

          break;

        case 'subnational':

          _.extend(options, {
            widgets: this.presenter.status.get('options')['widgets'],
            jurisdictions: this.presenter.status.get('options')['jurisdictions']
          });

          new SubNationalView(options);

          break;

        case 'areas-interest':

          _.extend(options, {
            widgets: this.presenter.status.get('options')['widgets'],
            areas: this.presenter.status.get('options')['areas']
          });

          new AreasView(options);
          break;
      }

      this._toggleWarnings();
    }

  });

  return CountryWidgetsView;

});
