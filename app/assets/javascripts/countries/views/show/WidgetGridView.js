define([
  'backbone',
  'countries/presenters/show/WidgetGridPresenter',
  'countries/views/show/ThemeTabsView',
  'countries/views/show/SelectorView',
  'views/WidgetView',
], function(Backbone, WidgetGridPresenter, ThemeTabsView, SelectorView, WidgetView) {

  'use strict';

  var CountryWidgetsView = Backbone.View.extend({

    el: '#reports',

    events: {},

    model: new (Backbone.Model.extend({
      defaults:{
        display: 'all',
        widgets: [1, 2, 3, 4, 5, 6],
        theme: 'national-data',
        selector: 'country'
      }
    })),

    initialize: function() {
      this.status = new WidgetGridPresenter(this);

      this._setListeners();

      // this.renderWidgets();
    },

    _setListeners: function() {
      this.model.on('change:display', this._setDisplay, this);
      this.model.on('change:widgets', this.renderWidgets, this);
    },

    _setDisplay: function() {
      var display = this.model.get('display');

      if (display === 'theme') {
        new ThemeTabsView();
      }

      if (display === 'selector') {
        new SelectorView();
      }
    },

    _checkEnabledWidgets: function() {
      console.log('checking..!');
      var newIndicators = this.model.get('widgets');
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

      console.log(enabledWidgets, newIndicators);

      this.model.set({'widgets': enabledWidgets}, { silent: true });
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

    renderWidgets: function() {

      this._checkEnabledWidgets();

      var enabledWidgets = this.model.get('widgets');

      console.log(enabledWidgets);

      enabledWidgets.forEach(_.bind(function(widget) {
        this.render(new WidgetView({id: widget}));
      }, this));
    },

    render: function(widget) {
      this.$el.append(widget.render());
    }

  });

  return CountryWidgetsView;

});
