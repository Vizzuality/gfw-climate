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

      this._setListeners();
      this._cacheVars();
    },

    start: function() {
      this.setupWidgets();
    },

    _setListeners: function() {
      // this.presenter.status.on('change:display', this.render, this);
      // this.presenter.status.on('change:widgets', this.render, this);
    },

    _cacheVars: function() {
      this.$moreIndicatorsWarning = $('.more-indicators-warning');
      this.$noIndicatorsWarning = $('.no-indicators-warning');
    },

    _toggleWarnings: function() {
      var view = this.presenter.status.get('view');

      if (view === 'national') {
        this.$noIndicatorsWarning.addClass('is-hidden');
        this.$moreIndicatorsWarning.removeClass('is-hidden');
      }
      else {

        if(view === 'subnational' && !this.presenter.status.get('jurisdictions') ||
          view === 'areas-interest' && !this.presenter.status.get('areas')) {

          this.$moreIndicatorsWarning.addClass('is-hidden');
        }
      }
    },

    _showModal: function(e) {
      e && e.preventDefault();
      mps.publish('Modal/open', [this.presenter.status.get('view')]);
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
      var promises = [],
        widgetsArray = [],
        iso = this.presenter.status.get('country'),
        widgets = this.presenter.status.get('options')[iso];

      _.map(widgets, function(widget, id) {
          var deferred = $.Deferred();
          var widgetOptions =  widget[0];
          var newWidget = new WidgetView({
            id: id,
            slug: iso,
            className: '',
            iso: iso,
            options: widgetOptions
          });

          newWidget._loadMetaData(function() {
            deferred.resolve();
          });

          widgetsArray.push(newWidget);
          promises.push(deferred);

      }.bind(this));

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
          _.extend(options, {
            jurisdictions: this.presenter.status.get('jurisdictions')
          });
          subview = new SubNationalView(options);
          break;
        case 'areas-interest':
          _.extend(options, {
            areas: this.presenter.status.get('areas')
          });
          subview = new AreasView(options);
          break;
      }


      this.$el.find('.reports-grid').append(subview.render().el);
    }

  });

  return CountryWidgetsView;

});
