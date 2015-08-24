define([
  'backbone',
  'mps',
  'countries/models/CountryModel',
  'countries/presenters/show/WidgetGridPresenter',
  'views/WidgetView'
], function(Backbone, mps, CountryModel, WidgetGridPresenter, WidgetView) {

  'use strict';

  var CountryWidgetsView = Backbone.View.extend({

    el: '#reports',

    events: {},

    initialize: function() {
      this.model = CountryModel;
      this.presenter = new WidgetGridPresenter(this);

      this._setListeners();
    },

    _setListeners: function() {},

    _checkEnabledWidgets: function() {
      var enabledWidgets = $('.country-widget');
      var ids = [];

      if (enabledWidgets.length > 0) {
        _.each(enabledWidgets, function(widget) {
          ids.push($(widget).attr('id'));
        });
      }

      return ids;
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

    renderWidgets: function(arg) {
      var enabledWidgets = this._checkEnabledWidgets(),
        newWidgets = arg;

      if (enabledWidgets.length > 0) {

        // Add only new widgets, don't touch the current ones
        newWidgets = _.difference(arg, enabledWidgets);

        // If neccesary, remove previously disabled widgets
        var removeWidgets = _.difference(enabledWidgets, arg);

        if (removeWidgets.length > 0) {
          this._removeDisabledWidgets(removeWidgets);
        }
      }

      newWidgets.forEach(_.bind(function(widget) {
        this.render(new WidgetView({id: widget}));
      }, this));
    },

    render: function(widget) {
      this.$el.append(widget.render());
    }

  });

  return CountryWidgetsView;

});
