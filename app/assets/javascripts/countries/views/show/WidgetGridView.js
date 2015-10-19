define([
  'backbone',
  'countries/presenters/show/WidgetGridPresenter',
  'widgets/views/WidgetView',
  'countries/views/show/reports/NationalView',
  'countries/views/show/reports/SubNationalView',
  'countries/views/show/reports/AreasView',
], function(Backbone, WidgetGridPresenter, WidgetView, NationalView,
    SubNationalView, AreasView) {

  'use strict';

  var CountryWidgetsView = Backbone.View.extend({

    el: '#reports',

    events: {
      'click .addIndicators' : '_showModal'
    },

    initialize: function() {
      this.presenter = new WidgetGridPresenter(this);

      this._setListeners();
      this._cacheVars();
    },

    start: function(countryModel) {
      this.CountryModel = countryModel;
      this._toggleWarnings();
      this.setupWidgets();
    },

    _setListeners: function() {
      // this.presenter.status.on('change:display', this.render, this);
      // this.presenter.status.on('change:widgets', this.render, this);
    },

    _cacheVars: function() {
      this.$noIndicatorsWarning = $('.no-indicators-warning');
      this.$moreIndicatorsWarning = $('.more-indicators-warning');
    },

    _toggleWarnings: function() {

      var widgetsOnGrid = 0;

      if (this.presenter.status.get('widgets')) {
        widgetsOnGrid = Object.keys(this.presenter.status.get('widgets')).length;
      }

      if (widgetsOnGrid > 0) {
        this.$moreIndicatorsWarning.removeClass('is-hidden');
        this.$noIndicatorsWarning.addClass('is-hidden');
      } else {
        this.$moreIndicatorsWarning.addClass('is-hidden');
        this.$noIndicatorsWarning.removeClass('is-hidden');
      }
    },

    _setDisplay: function(display) {
      this.presenter.status.set({
        'display': display
      });
    },

    _setWidgets: function(widgets) {
      this.presenter.status.set({
        'widgets': widgets
      }, { silent: true });

      this._checkEnabledWidgets();
    },

    _showModal: function(e) {
      e && e.preventDefault();
      this.presenter._onOpenModal();
    },

    _checkEnabledWidgets: function() {
      var newIndicators = this.presenter.status.attributes.widgets;
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

      this.presenter.status.set({'widgets': _.clone(enabledWidgets)});
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

    _getWidgetsId: function() {
      var ids = [],
        widgets = this.presenter.status.get('widgets');

      _.map(widgets, function(w) {
        ids.push(w.id);
      });
      return ids;
    },

    setupWidgets: function() {

      var widgets = this.presenter.status.get('widgets'),
        widgetsId = this._getWidgetsId(),
        promises = [];

      var widgetsArray = [];

      widgetsId.forEach(_.bind(function(id) {

        if (_.has(widgets, id)) {

          var deferred = $.Deferred();
          var options =  _.where(widgets, {id: id})[0];
          var currentWidget = new WidgetView(options);

          widgetsArray.push(currentWidget);

          currentWidget._loadMetaData({
            id: id,
            iso: this.CountryModel.get('iso')
          }, function(data) {

            var currentIndicator = _.where(currentWidget.widgetModel.get('indicators'), {default: true}),
              currentTab = _.where(currentWidget.widgetModel.get('tabs'), {default: true });

            options.indicators = currentIndicator[0];
            options.tab = currentTab[0];

            currentWidget.setupView(options);

            deferred.resolve(data);
          });

          promises.push(deferred);
        }

      }, this));

      $.when.apply(null, promises).then(function() {
        this.render(widgetsArray);
      }.bind(this));
    },

    render: function(widgetsArray) {
      var subview,
        view = this.presenter.status.get('view');
      var options = {
        widgets: widgetsArray
      };

      switch(view) {

        case 'national':
          subview = new NationalView(options);
          break;
        case 'subnational':
          subview = new SubNationalView(options);
          break;
        case 'areas-interest':
          subview = new AreasView(options);
          break;
      }

      this.$el.find('.reports-grid').append(subview.render().el);
    }

  });

  return CountryWidgetsView;

});
