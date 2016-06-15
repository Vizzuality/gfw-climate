define([
  'backbone',
  'insights/views/InsightsGladAlertsView',
], function(Backbone, InsightsGladAlertsView) {
  'use strict';

  var InsightsView = Backbone.View.extend({

    initialize: function(params) {
      this.insight = params.insight;

      this.render();
    },

    render: function() {
      this.renderInsight();
    },

    renderInsight: function() {
      switch(this.insight) {
        case 'glad-alerts':
          new InsightsGladAlertsView();
          return;
        default:
      }
    }
  });

  return InsightsView;

});
