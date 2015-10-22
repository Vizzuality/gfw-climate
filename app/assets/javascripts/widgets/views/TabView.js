define([
  'backbone',
  'handlebars',
  'widgets/presenters/TabPresenter',
  'text!widgets/templates/tab.handlebars',
  'widgets/indicators/line/LineChartIndicator',
  'widgets/indicators/map/MapIndicator',
  'widgets/indicators/pie/PieChartIndicator',
  'widgets/indicators/number/NumberChartIndicator',
], function(Backbone, Handlebars, TabPresenter, tpl, LineChartIndicator, MapIndicator, PieChartIndicator, NumberChartIndicator) {

  'use strict';

  var TabView = Backbone.View.extend({

    template: Handlebars.compile(tpl),

    events: {
      'change .threshold' : 'changeThreshold',
      'click .switcher-item' : 'changeUnit'
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
      this.$switcher = this.$el.find('.switcher');
      this.$graphContainer = this.$el.find('.tab-graph');
    },

    // CHANGE EVENTS
    changeThreshold: function(e) {
      this.presenter.changeThreshold($(e.currentTarget).val());
    },

    changeUnit: function(e) {
      this.presenter.changeUnit($(e.currentTarget).data('unit'));
    },

    // SETTERS
    setStatusValues: function() {
      this.$start_date.val(this.presenter.status.get('tabs').start_date);
      this.$end_date.val(this.presenter.status.get('tabs').end_date);
      this.$threshold.val(this.presenter.status.get('tabs').thresh);
      this.$switcher.find('li[data-unit='+this.presenter.status.get('tabs').unit+ ']').addClass('is-active');
    },

    setIndicator: function() {
      var type = this.presenter.status.get('tabs').type;
      switch(type) {
        case 'line':
          var indicator = _.findWhere(this.presenter.model.get('indicators'),{ unit: this.presenter.status.get('tabs').unit});
          new LineChartIndicator({
            el: this.$graphContainer,
            model: {
              id: indicator.id,
              unit: this.presenter.status.get('tabs').unit
            },
            data: {
              iso: this.presenter.model.get('iso'),
              thresh: this.presenter.status.get('tabs').thresh
            }
          });
          break;

        case 'number':
          var indicator = _.findWhere(this.presenter.model.get('indicators'),{ tab: this.presenter.status.get('tabs').position})
          new NumberChartIndicator({
            el: this.$graphContainer,
            model: {
              id: indicator.id,
              // widgets json must save this parameter
              template: 'umd'
            },
            data: {
              iso: this.presenter.model.get('iso'),
              thresh: this.presenter.status.get('tabs').thresh
            }
          });
          break;
      };

    },

  });

  return TabView;

});
