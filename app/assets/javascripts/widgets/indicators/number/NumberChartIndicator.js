define([
  'd3',
  'underscore',
  'handlebars',
  'widgets/views/IndicatorView',
  'widgets/models/IndicatorModel',
  'text!widgets/templates/indicators/number/forest-area-umd.handlebars',
  'text!widgets/templates/indicators/number/forest-area-national.handlebars',
  'text!widgets/templates/indicators/number/forest-area-fao.handlebars',
  'text!widgets/templates/indicators/number/soil-carbon-density.handlebars',
  'text!widgets/templates/indicators/number/soil-carbon-stocks.handlebars',
  'text!widgets/templates/indicators/number/emissions-peat-drainage.handlebars',
  'text!widgets/templates/indicators/number/deforestation-emissions.handlebars',
  'text!widgets/templates/indicators/no-data.handlebars',
], function(d3, _, Handleabars, IndicatorView, IndicatorModel,
  forestAreaUmdTpl, forestAreaNationalTpl, forestAreaFaoTpl, soilCarbonDensityTpl, soilCarbonStocksTpl, emissionsPeatDrainageTpl, deforestationEmissionsTpl, noDataTpl) {

  'use strict';

  var MapIndicator = IndicatorView.extend({

    templates: {
      "forest-area-umd": Handlebars.compile(forestAreaUmdTpl),
      "forest-area-national": Handlebars.compile(forestAreaNationalTpl),
      "forest-area-fao" : Handlebars.compile(forestAreaFaoTpl),
      "soil-carbon-density" : Handlebars.compile(soilCarbonDensityTpl),
      "soil-carbon-stocks" : Handlebars.compile(soilCarbonStocksTpl),
      "emissions-peat-drainage" : Handlebars.compile(emissionsPeatDrainageTpl),
      "deforestation-emissions" : Handlebars.compile(deforestationEmissionsTpl),
      "nodata" : Handlebars.compile(noDataTpl)
    },

    events: function() {
      return _.extend({}, IndicatorView.prototype.events, {});
    },

    initialize: function(setup) {
      this.constructor.__super__.initialize.apply(this, [setup]);
      // Enable params when we have API data
      this.model = new IndicatorModel(setup.model);

      // Fetch values
      this.$el.addClass('is-loading');
      this.model.fetch({
        data: this.setFetchParams(setup.data)
      }).done(function() {
        this.render();
        this.$el.removeClass('is-loading');
      }.bind(this));
    },

    render: function() {
      var tpl = this.model.get('template');
      if (!!this.model.get('data')[0]) {
        this.$el.html(this.templates[tpl](this.parseData()));
      } else {
        this.$el.html(this.templates['nodata']({ classname: 'number' }));
      }
    },

    parseData: function() {
      var data = this.model.get('data')[0];
      var shortened = d3.format(",.0f")(data.value);
      var scientific = d3.format(".3s")(data.value);
      return {
        country_name: data.country_name,
        valueString: data.value > 1000 ? scientific : shortened,
        millionsValueString: shortened
      };
    }

  });

  return MapIndicator;

});
