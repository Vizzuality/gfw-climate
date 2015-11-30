define([
  'backbone',
  'handlebars',
  'widgets/presenters/TabPresenter',
  'text!widgets/templates/tab.handlebars',
  'text!widgets/templates/indicators/line/linechart-averages.handlebars',
  'widgets/indicators/line/LineChartIndicator',
  'widgets/indicators/multiline/MultiLineChartIndicator',
  'widgets/indicators/map/MapIndicator',
  'widgets/indicators/pie/PieChartIndicator',
  'widgets/indicators/number/NumberChartIndicator',
  'widgets/indicators/list/ListChartIndicator',
], function(Backbone, Handlebars, TabPresenter, tpl, averageTpl, LineChartIndicator, MultiLineChartIndicator, MapIndicator, PieChartIndicator, NumberChartIndicator, ListChartIndicator) {

  'use strict';

  var TabView = Backbone.View.extend({

    template: Handlebars.compile(tpl),
    templateAverage: Handlebars.compile(averageTpl),

    events: {
      'change .threshold' : 'changeThreshold',
      'change .start-date' : 'changeStartDate',
      'change .end-date' : 'changeEndDate',
      'change .section' : 'changeSection',
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
      this.setIndicator();
      this.setStatusValues();
      return this;
    },

    parseData: function() {
      return this.presenter.model.get('data');
    },

    cacheVars: function() {
      this.$start_date = this.$el.find('.start-date');
      this.$end_date = this.$el.find('.end-date');
      this.$date_selects = this.$el.find('.date-selector');
      this.$threshold = this.$el.find('.threshold');
      this.$switcher = this.$el.find('.switcher');
      this.$average = this.$el.find('.tab-average');

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

    changeSection: function(e) {
      this.presenter.changeSection($(e.currentTarget).val());
    },


    // SETTERS
    setStatusValues: function() {
      var t = this.presenter.status.get('tabs');
      (!!t.start_date && !!t.end_date) ? this.setDates() : null;
      (!!t.thresh) ? this.$threshold.val(t.thresh) : null;
      (!!t.unit) ? this.$switcher.find('li[data-unit='+t.unit+ ']').addClass('is-active') : null;
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

    // SETTERS: average
    setAverage: function(averages) {
      this.$average.html(this.templateAverage({averages: averages}));
    },

    // SETTERS: indicator
    setIndicator: function() {
      var t = this.presenter.status.get('tabs');
      switch(t.type) {
        case 'line':
          var indicators = _.where(this.presenter.model.get('indicators'),{ unit: t.unit });
          if (!!indicators.length) {
            this.indicator = new MultiLineChartIndicator({
              el: this.$graphContainer,
              tab: this,
              className: 'is-line',
              model: {
                indicators: indicators,
                unit: t.unit,
                unitname: _.findWhere(this.presenter.model.get('data').switch, { unit: t.unit }).unitname,
                start_date: t.start_date,
                end_date: t.end_date,
                type: 'line',
                slug: this.presenter.model.get('slug'),
                // Compare model params
                lock: t.lock,
                location_compare: this.presenter.model.get('location_compare'),
                slug_compare: this.presenter.model.get('slug_compare'),
              },
              data: {
                location: this.presenter.model.get('location'),
                thresh: t.thresh,
              }
            });
          }
          break;

        case 'list':
          var indicators = _.where(this.presenter.model.get('indicators'),{ unit: t.unit });
          if (!!indicators.length) {
            this.indicator = new ListChartIndicator({
              el: this.$graphContainer,
              tab: this,
              className: 'is-list',
              model: {
                indicators: indicators,
                type: 'list',
              },
              data: {
                location: this.presenter.model.get('location'),
                thresh: t.thresh,
              }
            });
          }
          break;

        case 'pie':
          var indicators = _.where(this.presenter.model.get('indicators'),{ section: t.section});
          if (!!indicators.length) {
            this.indicator = new PieChartIndicator({
              el: this.$graphContainer,
              tab: this,
              className: 'is-pie',
              model: {
                indicators: indicators,
                section: t.section,
                sectionswitch: this.presenter.model.get('data').sectionswitch,
                template: t.template,
                type: 'pie',
              },
              data: {
                location: this.presenter.model.get('location'),
                thresh: t.thresh,
              }
            });
          }
          break;

        case 'number':
          var indicator = _.findWhere(this.presenter.model.get('indicators'),{ tab: t.position});
          if (!!indicator) {
            this.indicator = new NumberChartIndicator({
              el: this.$graphContainer,
              tab: this,
              className: 'is-number',
              model: {
                id: indicator.id,
                template: t.template,
                type: 'number',
              },
              data: {
                location: this.presenter.model.get('location'),
                thresh: t.thresh,
              }
            });
          }
          break;

      };

    },

    destroy: function() {
      this.presenter.destroy();
      this.undelegateEvents();
      this.$el.removeData().unbind();
      if (!!this.indicator) {
        this.indicator.destroy();
      }
    }

  });

  return TabView;

});
