define([
  'backbone',
  'insights/views/InsightsView'
], function(Backbone, InsightsView) {
  'use strict';

  var EmbedInsightsView = Backbone.View.extend({

    el: '#embedInsights',

    initialize: function(params) {
      this.insight = params.insight;

      this.render();
    },

    render: function() {
      new InsightsView({
        insight: this.insight
      })
    }
  });

  return EmbedInsightsView;

});
