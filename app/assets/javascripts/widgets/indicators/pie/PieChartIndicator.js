define(
  [
    'underscore',
    'd3',
    'handlebars',
    'widgets/views/IndicatorView',
    'widgets/models/IndicatorModel',
    'widgets/indicators/pie/PieChart',
    'text!widgets/templates/indicators/pie/biomass-carbon-stocks.handlebars',
    'text!widgets/templates/indicators/pie/biomass-density.handlebars',
    'text!widgets/templates/indicators/no-data.handlebars'
  ],
  function(
    _,
    d3,
    Handleabars,
    IndicatorView,
    IndicatorModel,
    PieChart,
    carbonStocksTpl,
    biomassDensityTpl,
    noDataTpl
  ) {
    'use strict';

    var PieChartIndicator = IndicatorView.extend({
      templates: {
        'biomass-carbon-stocks': Handlebars.compile(carbonStocksTpl),
        'biomass-density': Handlebars.compile(biomassDensityTpl),
        'no-data': Handlebars.compile(noDataTpl)
      },

      events: function() {
        return _.extend({}, IndicatorView.prototype.events, {
          'change .section': 'changeSection'
        });
      },

      initialize: function(setup) {
        this.constructor.__super__.initialize.apply(this, [setup]);

        this.$el.addClass('is-loading');

        this.model = new (Backbone.Model.extend({
          defaults: setup.model
        }))();
        this.fetchData(setup);
      },

      fetchData: function(setup) {
        var status = {
          promises: []
        };
        _.each(
          this.model.get('indicators'),
          _.bind(function(i) {
            var deferred = $.Deferred();
            new IndicatorModel({ id: i.id })
              .fetch({
                data: this.setFetchParams(setup.data)
              })
              .done(function(data) {
                deferred.resolve(data);
              });
            status.promises.push(deferred);
          }, this)
        );

        // Promises of each country resolved
        $.when.apply(null, status.promises).then(
          _.bind(function() {
            this.$el.removeClass('is-loading');
            var args = Array.prototype.slice.call(arguments);
            var values = _.compact(
              _.map(args, function(i) {
                return i.values[0];
              })
            );

            if (!!values.length) {
              values = _.groupBy(values, 'indicator_id');

              var data = _.map(this.model.get('indicators'), function(i) {
                var aux = values[i.id][0];
                var displayName = aux.id_1
                  ? aux.sub_nat_name
                  : aux.boundary_id != 1 ? aux.boundary_name : aux.country_name;
                i.location_name = displayName;
                i.data = values[i.id];
                return i;
              });
              this.model.set('data', data);
              this.render();
            } else {
              this.$el.html(this.templates['no-data']({ classname: 'pie' }));
            }
          }, this)
        );
      },

      render: function() {
        var tpl = this.model.get('template');
        this.$el.html(this.templates[tpl](this.parseData()));
        this.cacheVars();
        this.setStatusValues();
        this.drawGraph();
        return this;
      },

      parseData: function() {
        var totalVal = _.findWhere(this.model.get('data'), { type: 'total' })
          .data[0].value;
        var shortened = d3.format(',.0f')(totalVal);
        var scientific = d3.format('.3s')(totalVal);
        return {
          sectionswitch: this.model.get('sectionswitch'),
          location_name: this.model.get('data')[0].location_name,
          total: totalVal > 1000 ? scientific : shortened,
          millionsTotal: shortened
        };
      },

      cacheVars: function() {
        this.$section = this.$el.find('.section');
        this.$section_name = this.$el.find('.section-name');
      },

      setStatusValues: function() {
        var t = this.model.toJSON();
        if (!!t.section) {
          this.$section.val(t.section);
          this.$section_name.text(t.section);
        }
      },

      // SELECT
      changeSection: function(e) {
        this.$section_name.text($(e.currentTarget).val());
      },

      // GRAPH
      drawGraph: function() {
        var pieChart = new PieChart({
          el: this.$el.find('.pie-graph')[0],
          data: this.graphData(),
          sizing: { top: 0, right: 0, bottom: 0, left: 0 },
          innerPadding: { top: 0, right: 0, bottom: 0, left: 0 }
        });
        pieChart.render();
      },

      graphData: function() {
        var pieIndicators = _.where(this.model.get('data'), { type: 'pie' });
        return _.map(pieIndicators, function(i) {
          return {
            name: i.direction,
            value: i.data[0].value
          };
        });
      }
    });

    return PieChartIndicator;
  }
);
