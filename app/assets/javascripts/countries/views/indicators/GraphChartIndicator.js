define([
  'underscore',
  'views/WidgetView'
], function(_,WidgetView) {

  'use strict';

  var GraphChart = WidgetView.extend({

    events: function() {
      return _.extend({}, WidgetView.prototype.events, {});
    },

    initialize: function() {
      this.constructor.__super__.initialize.apply(this);
    }

  });

  return GraphChart;

});
