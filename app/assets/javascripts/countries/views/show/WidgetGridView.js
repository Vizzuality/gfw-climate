define([
  'backbone',
  'countries/models/CountryModel',
  'countries/presenters/show/WidgetGridPresenter',
  'countries/views/show/reports/NationalView',
  'countries/views/show/reports/SubNationalView',
  'countries/views/show/reports/AreasView',
], function(Backbone, CountryModel, WidgetGridPresenter, NationalView,
    SubNationalView, AreasView) {

  'use strict';

  var CountryWidgetsView = Backbone.View.extend({

    el: '#reports',

    events: {
      'click .addIndicators' : '_showModal'
    },

    model: new (Backbone.Model.extend({
      defaults:{
        display: 'national',
        widgets: [1, 2]
      }
    })),

    initialize: function() {
      this.presenter = new WidgetGridPresenter(this);

      this._setListeners();
      this._cacheVars();

      this._toggleWarnings();
    },

    start: function(arg) {
      this.render();
    },

    _setListeners: function() {
      this.model.on('change:display', this.render, this);
      this.model.on('change:widgets', this.render, this);
    },

    _cacheVars: function() {
      this.$noIndicatorsWarning = $('.no-indicators-warning');
      this.$moreIndicatorsWarning = $('.more-indicators-warning');
    },

    _toggleWarnings: function() {
      var widgetsOnGrid = this.model.attributes.widgets.length;

      if (widgetsOnGrid > 0) {
        this.$moreIndicatorsWarning.removeClass('is-hidden');
        this.$noIndicatorsWarning.addClass('is-hidden');
      } else {
        this.$moreIndicatorsWarning.addClass('is-hidden');
        this.$noIndicatorsWarning.removeClass('is-hidden');
      }
    },


    _setDisplay: function(display) {
      this.model.set({
        'display': display
      });
    },

    _setWidgets: function(widgets) {
      this.model.set({
        'widgets': widgets
      }, { silent: true });

      this._checkEnabledWidgets();
    },

    _showModal: function(e) {
      e && e.preventDefault();
      this.presenter._onOpenModal();
    },

    _checkEnabledWidgets: function() {
      var newIndicators = this.model.attributes.widgets;
      var currentWidgets = $('.country-widget'),
        enabledWidgets = [];

      if (currentWidgets.length > 0) {
        _.each(currentWidgets, function(widget) {
          enabledWidgets.push($(widget).attr('id'));
        });

        if (newIndicators && newIndicators.length > 0) {

          // Add only new widgets, don't touch the current ones
          enabledWidgets = _.difference(newIndicators, enabledWidgets);

          // If neccesary, remove previously disabled widgets
          var removeWidgets = _.difference(enabledWidgets, newIndicators);

          if (removeWidgets.length > 0) {
            this._removeDisabledWidgets(removeWidgets);
          }
        }

      } else {
        enabledWidgets = newIndicators;
      }

      this.model.set({'widgets': _.clone(enabledWidgets)});
    },

    _removeDisabledWidgets: function(removeWidgets) {
      var $widgets = $('.country-widget');

      _.each($widgets, function(widget) {
        _.each(removeWidgets, function(removeId) {
          if (removeId === widget.id) {
            $(widget).remove();
          }
        });
      });
    },

    render: function() {
      this._toggleWarnings();

      var subview;

      switch(this.model.attributes.display) {

        case 'national':
          subview = new NationalView(this.model);
          break;
        case 'subnational':
          subview = new SubNationalView(this.model);
          break;
        case 'areas-interest':
          subview = new AreasView(this.model);
          break;
      }

      this.$el.find('.reports-grid').append(subview.render().el);
    }

  });

  return CountryWidgetsView;

});
