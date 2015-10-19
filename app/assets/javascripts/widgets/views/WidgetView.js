define([
  'backbone',
  'handlebars',
  'countries/models/CountryModel',
  'widgets/presenters/WidgetPresenter',
  'widgets/models/WidgetModel',
  'widgets/indicators/line/LineChartIndicator',
  'widgets/indicators/map/MapIndicator',
  'widgets/indicators/pie/PieChartIndicator',
  'text!widgets/templates/widget.handlebars'
], function(Backbone, Handlebars, CountryModel, WidgetPresenter, widgetModel, LineChartIndicator,
  MapIndicator, PieChartIndicator, tpl) {

  'use strict';

  var WidgetView = Backbone.View.extend({

    template: Handlebars.compile(tpl),

    events: {
      'click .close'                : '_close',
      'click #info'                 : '_info',
      'click #share'                : '_share',
      'click .indicators-grid__item': '_onClick'
      // 'change .selector'            : 'updateTreshold'
    },

    initialize: function() {
      this.presenter = new WidgetPresenter(this);

      this.widgetModel = new widgetModel({
        iso: CountryModel.get('iso')
      });
    },

    setupView: function(options) {
      this.presenter.setParams(options);
    },

    start: function() {
      // this._loadMetaData((this.render.bind(this)));
    },

    // updateTreshold: function(e) {
    //   var treshold = e.currentTarget.value;
    //   this.presenter.updateStatus({
    //     treshold: treshold
    //   });
    // },

    /**
     * Setup the current tab and update the status.
     * @param  {click event} e
     */
    _onClick: function(e) {
      var tab = $(e.currentTarget).data('position');
      this.presenter.onUpdateWidget({
        tab: {
          position: tab
        }
      })
    },

    /**
     * Set the class "is-selected" to the tab settted by
     * the presenter status.
     */
    _setTab: function() {
      var indicatorTabs = this.$el.find('.indicators-grid__item'),
        currentTab = this.presenter.status.get('tab');

      $(indicatorTabs).removeClass('is-selected');

      this.$el.find('[data-position="' + currentTab.position + '"]').addClass('is-selected');
    },

    _loadMetaData: function(params, callback) {
      // var widgetId = this.presenter.status.get('id');

      this.widgetModel.getData(params, callback);
    },

    _close: function(e) {
      e && e.preventDefault();
      this.$el.remove();
    },

    _info: function() {},

    _share: function() {},

    render: function() {

      this.$el.html(this.template({
        id: this.widgetModel.get('id'),
        tabs: this.widgetModel.get('tabs'),
        name: this.widgetModel.get('name')
      }));

      this._setTab();

      // Mejorar
      $(document.querySelector('.reports-grid').firstChild).append(this.el);

      var widgetId = this.presenter.status.get('id');
      var $nextEl = $('#' + widgetId).find('.graph-container');
      var indicatorType = this.presenter.status.get('indicators').type;

      switch(indicatorType) {
        case 'line':
          new LineChartIndicator({
            el: $nextEl,
            indicator: this.presenter.status.get('indicators')
          });

          break;

        case 'pie':
          // Stuff
          break;
      };

      return this;
    }

  });

  return WidgetView;

});
