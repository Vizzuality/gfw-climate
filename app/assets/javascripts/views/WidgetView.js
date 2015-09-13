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

    url: '/api/widgets/',

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
      this._loadMetaData();
    },

    _setCurrentIndicator: function(e) {
      // debugger;
      var indicatorTabs = document.querySelectorAll('.indicators-grid__item'),
        currentIndicator = e.currentTarget;

      $(indicatorTabs).toggleClass('is-selected');
      $(currentIndicator).addClass('is-selected');

      //this._loadIndicator(currentIndicator);
    },

    _loadMetaData: function() {
      //var indicatorType = indicator.getAttribute('data-name');
      // TO-DO: API call
      var iso = CountryModel.attributes.iso;

      var url = this.url + '/' + this.id;
      

      $.ajax({
        url: url,
        data: {
          iso: iso
        },
        success: _.bind(function(data) {
          console.log(data);
          this.render(data.widget)
        }, this),
        error: function(err) {
          throw err;
        }
      });
    },

    _close: function(e) {
      e && e.preventDefault();
      this.$el.remove();
    },

    _info: function() {},

    _share: function() {},

    render: function(data) {

      console.log(data);

      this.$el.find('.national-grid').prepend(this.template({
        id: data.id,
        name: data.name,
        type: data.type,
        indicators: data.indicators
      }));

      if (data.type === 'line') {
        this.$el.find('.graph-container').append(new GraphChartIndicator().render().el);        
      } 

      if (data.type === "pie") {
        this.$el.find('.graph-container').append(new PieChartIndicator().render().el);  
      }

      // $('.indicators-grid__item:first-child').trigger('click');

      return this;
    }

  });

  return WidgetView;

});
