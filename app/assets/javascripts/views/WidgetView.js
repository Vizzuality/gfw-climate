define([
  'backbone',
  'handlebars',
  'countries/models/CountryModel',
  'countries/presenters/show/WidgetPresenter',
  'countries/models/WidgetModel',
  'countries/views/indicators/LineChartIndicator',
  'countries/views/indicators/MapIndicator',
  'countries/views/indicators/PieChartIndicator',
  'text!countries/templates/country-widget.handlebars'
], function(Backbone, Handlebars, CountryModel, WidgetPresenter, widgetModel, LineChartIndicator,
  MapIndicator, PieChartIndicator, tpl) {

  'use strict';

  var WidgetView = Backbone.View.extend({

    template: Handlebars.compile(tpl),

    // collection: new widgetCollection(),

    events: {
      'click .close' : '_close',
      'click #info'   : '_info',
      'click #share'  : '_share',
      'click .indicators-grid__item': '_setCurrentIndicator',
      'change .selector': 'updateTreshold'
    },

    initialize: function(options) {
      this.presenter = new WidgetPresenter(this);

      this.wid = options.id;
      this.widgetModel = new widgetModel();
      this.CountryModel = CountryModel;
    },

    start: function(p) {
      this._loadMetaData((this.render).bind(this));
    },

    updateTreshold: function(e) {
      var treshold = e.currentTarget.value;
      this.presenter.updateStatus({
        treshold: treshold
      });
    },

    _setCurrentIndicator: function(e) {
      var indicatorTabs = document.querySelectorAll('.indicators-grid__item'),
        currentIndicator = e.currentTarget;

      $(indicatorTabs).removeClass('is-selected');
      $(currentIndicator).addClass('is-selected');
    },

    _loadMetaData: function(callback) {
      var widgetId = this.wid;

      this.widgetModel.getData(widgetId, callback);
    },

    _close: function(e) {
      e && e.preventDefault();
      this.$el.remove();
    },

    _info: function() {},

    _share: function() {},

    render: function() {

      this.$el.html(this.template({
        id: this.widgetModel.attributes.id,
        indicators: this.widgetModel.attributes.indicators,
        name: this.widgetModel.attributes.name,
        type: this.widgetModel.attributes.type
      }));

      //firstDataSetLink is something like : "/api/indicators/1/GUY.
      //It should be the API endpoint where we retrieve data for the widget.
      var firstDataSetLink = this.widgetModel.attributes.indicators[0].data;
      var graphicId = this.widgetModel.attributes.id;
      //graphicId is the current graphic id.
      var data = {
        country: this.CountryModel.get('iso'),
        url: this.widgetModel.attributes.indicators[0].data
      };

      //I have talk we REE staff, and apparently it is better to work
      //with ids in order to differenciate elements.
      var widgetId = this.widgetModel.attributes.id;
      var nextEl = '#' + widgetId + '.country-widget .graph-container';

      // Mejorar
      $(document.querySelector('.reports-grid').firstChild).append(this.el);

      if (this.widgetModel.attributes.type === 'line') {
        new LineChartIndicator({el: nextEl}).render(data, graphicId);
      }

      // if (this.data.type === 'pie') {
      //   this.$el.find('.graph-container .content').append(new PieChartIndicator().render(firstDataSetLink).el);
      // }

      return this;
    }

  });

  return WidgetView;

});
