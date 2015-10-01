define([
  'backbone',
  'handlebars',
  'countries/models/CountryModel',
  'countries/collections/widgetCollection',
  'countries/views/indicators/GraphChartIndicator',
  'countries/views/indicators/MapIndicator',
  'countries/views/indicators/PieChartIndicator',
  'text!countries/templates/country-widget.handlebars'
], function(Backbone, Handlebars, CountryModel, widgetCollection, GraphChartIndicator,
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

      this._keepWidgetId(widgetId);
    },

    _keepWidgetId: function(widgetId) {
      sessionStorage.setItem('currentWidgetId', widgetId)
    },

    _close: function(e) {
      e && e.preventDefault();
      this.$el.remove();
    },

    _info: function() {},

    _share: function() {},

    render: function() {

      this.$el.html(this.template({
        id: this.data.id,
        name: this.data.name,
        type: this.data.type,
        indicators: this.data.indicators
      }));

      //Set default option of data set to draw graph in first instance
      //When tabs will be working, we will call Chart.render() with the current API link.
      var firstDataSetLink = this.data.indicators[0].data;

      // Mejorar
      $(document.querySelector('.reports-grid').firstChild).append(this.el);

      if (this.data.type === 'line') {
        new GraphChartIndicator().render(firstDataSetLink);
      }

      if (this.data.type === 'pie') {
        this.$el.find('.graph-container .content').append(new PieChartIndicator().render(firstDataSetLink).el);
      }

      return this;
    }

  });

  return WidgetView;

});
