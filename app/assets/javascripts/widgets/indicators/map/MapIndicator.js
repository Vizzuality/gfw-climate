define([
  'underscore',
  'handlebars',
  'widgets/views/IndicatorView',
  'text!widgets/templates/widget-map.handlebars'
], function(_, Handleabars, IndicatorView, TPL) {

  'use strict';

  var MapIndicator = IndicatorView.extend({

    template: Handlebars.compile(TPL),

    events: function() {
      return _.extend({}, IndicatorView.prototype.events, {});
    },

    initialize: function() {
      console.log(this.$el);
      this.constructor.__super__.initialize.apply(this);
    },

    render: function() {
      var indicatorView = this.constructor.__super__.render();
      this.el = widgetView.template();
      this.$el.find('.country-widget__content').html(this.template);
    }

  });

  return MapIndicator;

});
