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

    el: '#reports',

    template: Handlebars.compile(tpl),

    events: {
      'click .close' : '_close',
      'click #info'   : '_info',
      'click #share'  : '_share'
    },

    initialize: function(data) {
      this.model = CountryModel;
      this.indicators = [];

      this._setIndicators();
    },

    _setIndicators: function() {

      // if (this.model.attribues.hasOwnProperty('umd')) {
      //   this.indicators.push('umd');
      // }

      // if (this.model.attribues.hasOwnProperty('forests')) {};
      //   this.indicators.push()

      for(var prop in this.model.attributes) {
        if (prop === 'umd') {
          this.indicators.push(prop);
        }

        if (prop === 'forests') {
          this.indicators.push(prop);
        }
      }


      this.render();

    },

    _close: function(e) {
      e && e.preventDefault();
      this.$el.remove();
    },

    _info: function() {},

    _share: function() {},

    render: function() {
      this.$el.html(this.template({indicators: this.indicators}))

      // $(this.el).html(this.template({id: this.id}));
      // return this;
    }

  });

  return WidgetView;

});
