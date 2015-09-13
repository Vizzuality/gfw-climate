define([
  'backbone',
  'handlebars',
  'countries/models/CountryModel',
  'countries/views/indicators/GraphChartIndicator',
  'countries/views/indicators/MapIndicator',
  'countries/views/indicators/PieChartIndicator',
  'text!countries/templates/country-widget.handlebars'
], function(Backbone, Handlebars, CountryModel, GraphChartIndicator,
  MapIndicator, PieChartIndicator, tpl) {

  'use strict';

  var WidgetView = Backbone.View.extend({

    // el: '.reports-grid',

    template: Handlebars.compile(tpl),

    events: {
      'click .close' : '_close',
      'click #info'   : '_info',
      'click #share'  : '_share',
      'click .indicators-grid__item': '_setCurrentIndicator'
    },

    initialize: function(data) {
      this.model = CountryModel;
      this.indicators = [];
      this.id = data.id;
      this.el = data.el;
      this._setIndicators();
    },

    _setCurrentIndicator: function(e) {
      // debugger;
      var indicatorTabs = document.querySelectorAll('.indicators-grid__item'),
        currentIndicator = e.currentTarget;

      // console.log(indicatorTabs);

      $(indicatorTabs).toggleClass('is-selected');
      $(currentIndicator).addClass('is-selected');

      // this._loadIndicator(currentIndicator);
    },

    _loadIndicator: function(indicator) {
      //var indicatorType = indicator.getAttribute('data-name');
      // TO-DO: API call
      var graphChart = new GraphChartIndicator();
    },

    _setIndicators: function() {

      for(var prop in this.model.attributes) {
        if (prop === 'umd') {
          this.indicators.push(prop);
        }

        if (prop === 'forests') {
          this.indicators.push(prop);
        }

        if (prop === 'tenure') {
          this.indicators.push(prop);
        }
      }

      // this.render();
    },

    _close: function(e) {
      e && e.preventDefault();
      this.$el.remove();
    },

    _info: function() {},

    _share: function() {},

    render: function() {

      this.$el.find('.national-grid').append(this.template({
        id: this.id,
        indicators: this.indicators
      }));

      this.$el.find('.graph-container').append(new GraphChartIndicator().render().el);

      // $('.indicators-grid__item:first-child').trigger('click');

      return this;
    }

  });

  return WidgetView;

});
