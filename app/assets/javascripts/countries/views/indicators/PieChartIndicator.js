define([
  'underscore',
  'views/WidgetView'
], function(_,WidgetView) {

  'use strict';

  var PieChartWidget = WidgetView.extend({

    events: function() {
      return _.extend({}, WidgetView.prototype.events, {});
    },

    initialize: function(widget) {
      console.log(widget);
      console.log('init PieChart Widget')
      this.constructor.__super__.initialize.apply(this);
    }

  })

  return PieChartWidget;

});
