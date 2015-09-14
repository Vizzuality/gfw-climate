define([
  'underscore',
  'handlebars',
  'views/WidgetView',
  'text!countries/templates/country-map-widget.handlebars'
], function(_, Handleabars, WidgetView, TPL) {

  'use strict';

  var MapWidget = WidgetView.extend({

    template: Handlebars.compile(TPL),

    events: function() {
      return _.extend({}, WidgetView.prototype.events, {});
    },

    initialize: function() {
      console.log(this.$el);
      this.constructor.__super__.initialize.apply(this);
    },

    render: function() {
      var widgetView = this.constructor.__super__.render();
      this.el = widgetView.template();
      this.$el.find('.country-widget__content').html(this.template);
    }

  });

  return MapWidget;

});
