define([
  'underscore',
  'countries/views/show/IndicatorView'
], function(_, IndicatorView) {

  'use strict';

  var GraphIndicator = IndicatorView.extend({

    events: function() {
      return _.extend({}, IndicatorView.prototype.events, {});
    },

    initialize: function() {
      this.constructor.__super__.initialize.apply(this);
    }

  });

  return GraphIndicator;

});
