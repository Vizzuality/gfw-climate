define([
  'backbone',
  'handlebars',
  'widgets/presenters/WidgetPresenter',
  'widgets/indicators/line/LineChartIndicator',
  'widgets/indicators/map/MapIndicator',
  'widgets/indicators/pie/PieChartIndicator',
  'text!widgets/templates/widget.handlebars'
], function(Backbone, Handlebars, WidgetPresenter, LineChartIndicator,
  MapIndicator, PieChartIndicator, tpl) {

  'use strict';

  var WidgetView = Backbone.View.extend({

    template: Handlebars.compile(tpl),

    events: {
      'click .close'                : '_close',
      'click #info'                 : '_info',
      'click #share'                : '_share',
      'click .indicators-tab'       : '_changeTab'
    },

    initialize: function(setup) {
      this.presenter = new WidgetPresenter(this, setup);
    },

    /**
     * Fetch MODEL
     * @param  {function} callback
     */
    _loadMetaData: function(callback) {
      this.presenter.model.fetch().done(function(){
        callback();
      }.bind(this));
    },

    /**
     * RENDER
     */
    render: function() {
      this.$el.html(this.template({
        id: this.presenter.model.get('id'),
        tabs: this.presenter.model.get('tabs'),
        name: this.presenter.model.get('name')
      }));

      this.cacheVars();

      this.initWidget();

      return this;
    },

    cacheVars: function() {
      this.$graphContainer = this.$el.find('.graph-container');
      this.$tabgrid = this.$el.find('.indicators-tabgrid');
      this.$tablink = this.$el.find('.indicators-tab');
    },

    initWidget: function() {
      this.setTab();
      this.setIndicator();
    },

    /**
     * SETTERS
     */
    setTab: function() {
      var tab = this.presenter.status.get('tabs');
      this.$tablink.removeClass('is-selected');
      this.$tabgrid.find('.indicators-tab[data-position="' + tab + '"]').addClass('is-selected');
    },

    setIndicator: function() {
      var indicatorType = this.presenter.status.get('indicators')[0].type;
      switch(indicatorType) {
        case 'line':
          new LineChartIndicator({
            el: this.$graphContainer,
            id: this.presenter.status.get('indicators')[0].id,
            iso: this.presenter.model.get('iso')
          });
          break;

        case 'pie':
          // Stuff
          break;
      };

    },

    /**
     * EVENTS
     * @param  {click event} e
     */
    _changeTab: function(e) {
      this.presenter.status.set('tabs', $(e.currentTarget).data('position'));
    },

    _close: function(e) {
      e && e.preventDefault();
      this.$el.remove();
    },

    _info: function(e) {},

    _share: function(e) {},



  });

  return WidgetView;

});
