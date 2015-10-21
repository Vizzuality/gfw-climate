define([
  'backbone',
  'handlebars',
  'widgets/presenters/TabPresenter',
  'text!widgets/templates/tab.handlebars',
  'widgets/indicators/line/LineChartIndicator',
  'widgets/indicators/map/MapIndicator',
  'widgets/indicators/pie/PieChartIndicator',
], function(Backbone, Handlebars, TabPresenter, tpl, LineChartIndicator, MapIndicator, PieChartIndicator) {

  'use strict';

  var TabView = Backbone.View.extend({

    template: Handlebars.compile(tpl),

    events: {
      'change .threshold' : 'changeThreshold'
    },

    initialize: function(setup) {
      this.presenter = new TabPresenter(this, setup);
      this.widget = setup.widget;
      this.render();
    },

    /**
     * RENDER
     */
    render: function() {
      this.$el.html(this.template(this.parseData()));
      this.delegateEvents();
      this.cacheVars();
      this.setStatusValues();
      this.setIndicator();
      return this;
    },

    parseData: function() {
      return this.presenter.model.get('data')
    },

    cacheVars: function() {
      this.$start_date = this.$el.find('.start-date');
      this.$end_date = this.$el.find('.end-date');
      this.$threshold = this.$el.find('.threshold');
      this.$graphContainer = this.$el.find('.tab-graph');
    },

    // CHANGE EVENTS
    changeThreshold: function(e) {
      this.presenter.changeThreshold($(e.currentTarget).val());
    },

    // SETTERS
    setStatusValues: function() {
      this.$start_date.val(this.presenter.status.get('tabs').start_date);
      this.$end_date.val(this.presenter.status.get('tabs').end_date);
      this.$threshold.val(this.presenter.status.get('tabs').thresh);
    },

    setIndicator: function() {
      var currentid = this.presenter.status.get('indicators')[0];
      var indicator = _.findWhere(this.presenter.model.get('indicators'),{id: currentid })

      switch(indicator.type) {
        case 'line':
          new LineChartIndicator({
            el: this.$graphContainer,
            id: indicator.id,
            iso: this.presenter.model.get('iso'),
            data: {
              thresh: this.presenter.status.get('tabs').thresh
            }
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
