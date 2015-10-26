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
      'change .start-date' : 'changeStartDate',
      'change .end-date' : 'changeEndDate',
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
      this.$date_selects = this.$el.find('.date-selector');
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

    changeStartDate: function(e) {
      this.presenter.changeStartDate($(e.currentTarget).val());
    },

    changeEndDate: function(e) {
      this.presenter.changeEndDate($(e.currentTarget).val());
    },

    // SETTERS
    setStatusValues: function() {
      var t = this.presenter.status.get('tabs');
      (!!t.start_date && !!t.end_date) ? this.setDates() : null;
      (!!t.thresh) ? this.$threshold.val(t.thresh) : null;
      (!!t.unit) ? this.$switcher.find('li[data-unit='+t.unit+ ']').addClass('is-active') : null;
      (!!t.section) ? console.log('setSection') : null;
    },

    // SETTERS: dates
    setDates: function() {
      this.$start_date.val(this.presenter.status.get('tabs').start_date);
      this.$end_date.val(this.presenter.status.get('tabs').end_date);
      this.toggleDisabledDates();
    },

    toggleDisabledDates: function(){
      _.each(this.$date_selects,_.bind(function(el){
        var $options = $(el).find('option');
        var compare = $(this.$el.find($(el).data('compare')))[0].selectedIndex;
        var direction = Boolean(parseInt($(el).data('direction')));

        _.each($options, function(opt,i){
          if (direction) {
            (compare <= i) ? $(opt).prop('disabled',true) : $(opt).prop('disabled',false);
          }else{
            (compare >= i) ? $(opt).prop('disabled',true) : $(opt).prop('disabled',false);
          }
        });
      }, this ));
    },

    // SETTERS: indicator
    setIndicator: function() {
      var t = this.presenter.status.get('tabs');
      switch(t.type) {
        case 'line':
          var indicator = _.findWhere(this.presenter.model.get('indicators'),{ unit: t.unit});
          new LineChartIndicator({
            el: this.$graphContainer,
            model: {
              id: indicator.id,
              unit: t.unit,
              start_date: t.start_date,
              end_date: t.end_date,
            },
            data: {
              iso: this.presenter.model.get('iso'),
              thresh: t.thresh
            }
          });
          break;

        case 'pie':
          var indicators = _.where(this.presenter.model.get('indicators'),{ section: t.section});
          new PieChartIndicator({
            el: this.$graphContainer,
            model: {
              indicators: indicators,
              template: 'biomass-carbon'
            },
            data: {
              iso: this.presenter.model.get('iso'),
              thresh: t.thresh
            }
          });
          break;

        case 'number':
          var indicator = _.findWhere(this.presenter.model.get('indicators'),{ tab: t.position})
          new NumberChartIndicator({
            el: this.$graphContainer,
            model: {
              id: indicator.id,
              // widgets json must save this parameter
              template: 'umd'
            },
            data: {
              iso: this.presenter.model.get('iso'),
              thresh: t.thresh
            }
          });
          break;

      };

    },

  });

  return TabView;

});
