define([
  'd3',
  'underscore',
  'handlebars',
  'widgets/views/IndicatorView',
  'widgets/models/IndicatorModel',
  'text!widgets/templates/indicators/number/number-umd.handlebars',
  'text!widgets/templates/indicators/number/number-fao.handlebars',
  'text!widgets/templates/indicators/no-data.handlebars',
], function(d3, _, Handleabars, IndicatorView, IndicatorModel, umdTpl, faoTpl, noDataTpl) {

  'use strict';

  var MapIndicator = IndicatorView.extend({

    templates: {
      umd: Handlebars.compile(umdTpl),
      fao: Handlebars.compile(faoTpl),
      nodata: Handlebars.compile(noDataTpl)
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

    setFetchParams: function(data) {
      if (data.location) {
        data.iso = data.location.iso;
        data.id_1 = data.location.jurisdiction;
        data.area = data.location.area;
        delete data.location
      }
      return data;
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
      var parseValues = d3.format(".3s");
      var valueString = parseValues(data.value) + ' hectares';
      return {
        country_name: data.country_name,
        valueString: valueString
      };
    }

  });

  return MapIndicator;

});
