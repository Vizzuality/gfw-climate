define([
  'backbone',
  'handlebars',
  'countries/models/CountryModel',
  'countries/collections/widgetCollection',
  'countries/views/indicators/LineChartIndicator',
  'countries/views/indicators/MapIndicator',
  'countries/views/indicators/PieChartIndicator',
  'text!countries/templates/country-widget.handlebars'
], function(Backbone, Handlebars, CountryModel, widgetCollection, LineChartIndicator,
  MapIndicator, PieChartIndicator, tpl) {

  'use strict';

  var WidgetView = Backbone.View.extend({

    template: Handlebars.compile(tpl),

    collection: new widgetCollection(),

    events: {
      'click .close' : '_close',
      'click #info'   : '_info',
      'click #share'  : '_share',
      'click .indicators-grid__item': '_setCurrentIndicator'
    },

    initialize: function(data) {
      this.model = CountryModel;
      this.wid = data.wid;
    },

    _setCurrentIndicator: function(e) {
      var indicatorTabs = document.querySelectorAll('.indicators-grid__item'),
        currentIndicator = e.currentTarget;

      $(indicatorTabs).removeClass('is-selected');
      $(currentIndicator).addClass('is-selected');
    },

    _loadMetaData: function(callback) {
      var widgetId = this.wid;
      this.collection._loadData(widgetId, _.bind(function() {
        this.data = this.collection.models[0].toJSON();
        callback(this.data);
      }, this));
    },

    _close: function(e) {
      e && e.preventDefault();
      this.$el.remove();
    },

    _info: function() {},

    _share: function() {},

    render: function() {
      //Render widget frame template (tabs, and so on...)
      this.$el.html(this.template({
        id: this.data.id,
        name: this.data.name,
        type: this.data.type,
        indicators: this.data.indicators
      }));

      //firstDataSetLink is something like : "/api/indicators/1/GUY.
      //It should be the API endpoint where we retrieve data for the widget.
      var firstDataSetLink = this.data.indicators[0].data;
      //graphicId is the current graphic id.
      var graphicId = this.data.indicators[0].id;
      // console.log(graphicId);

      //I have talk we REE staff, and apparently it is better to work
      //with ids in order to differenciate elements.
      var widgetId = this.data.id;
      var nextEl = '#' + widgetId + '.country-widget .graph-container';

      // Mejorar
      $(document.querySelector('.reports-grid').firstChild).append(this.el);

      if (this.data.type === 'line') {
        new LineChartIndicator({el: nextEl}).render(firstDataSetLink, graphicId);
      }

      if (this.data.type === 'pie') {
        this.$el.find('.graph-container .content').append(new PieChartIndicator().render(firstDataSetLink).el);
      }

      return this;
    }

  });

  return WidgetView;

});
