define([
  'backbone',
  'handlebars',
  'widgets/presenters/TabPresenter',
  'text!widgets/templates/tab.handlebars',
  // 'widgets/indicators/line/LineChartIndicator',
  // 'widgets/indicators/map/MapIndicator',
  // 'widgets/indicators/pie/PieChartIndicator',
], function(Backbone, Handlebars, TabPresenter, tpl) {

  'use strict';

  var TabView = Backbone.View.extend({

    template: Handlebars.compile(tpl),

    initialize: function(setup) {
      this.presenter = new TabPresenter(this, setup);
      this.render();
    },

    /**
     * RENDER
     */
    render: function() {
      this.$el.html(this.template());
      this.cacheVars();
      return this;
    },

    cacheVars: function() {
      this.$graphContainer = this.$el.find('.tab-graph');
    },

    setIndicator: function() {
      var indicatorType = this.presenter.status.get('indicators')[0].type;
      switch(indicatorType) {
        case 'line':
          new LineChartIndicator({
            el: this.$graphContainer,
            id: this.presenter.status.get('indicators')[0].id,
            iso: this.presenter.model.get('iso')
          });
          break;

        case 'pie':
          // Stuff
          break;
      };

    },

  });

  return TabView;

});
