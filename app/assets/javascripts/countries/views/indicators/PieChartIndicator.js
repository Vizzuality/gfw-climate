define([
  'underscore',
  'countries/views/show/IndicatorView',
], function(_,IndicatorView) {

  'use strict';

  var PieChartIndicator = IndicatorView.extend({

    events: function() {
      return _.extend({}, IndicatorView.prototype.events, {});
    },

    initialize: function(widget) {
      this.constructor.__super__.initialize.apply(this);
    }

  });

  return PieChartIndicator;

});
