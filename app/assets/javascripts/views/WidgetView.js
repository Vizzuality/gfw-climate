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
      'click .close'                : '_close',
      'click #info'                 : '_info',
      'click #share'                : '_share',
      'click .indicators-grid__item': '_onClick'
      // 'change .selector'            : 'updateTreshold'
    },

    initialize: function() {
      this.presenter = new WidgetPresenter(this);

      // this.presenter.setParams();
      // console.log(this.presenter.status.toJSON());
      this.widgetModel = new widgetModel();
      this.CountryModel = CountryModel;
    },

    setupView: function(options) {
      this.presenter.setParams(options);
    },

    start: function() {
      this._loadMetaData((this.render.bind(this)));
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

    _loadMetaData: function(widgetId, callback) {
      // var widgetId = this.presenter.status.get('id');

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
        id: this.widgetModel.get('id'),
        tabs: this.widgetModel.get('tabs'),
        name: this.widgetModel.get('name')
      }));

      this._setTab();

      // var indicatorActived = this.presenter.status.get('indicatorActived');
      var widgetId = this.presenter.status.get('id');
      var currentDataSetLink = this.presenter.status.get('')


      var data = {
        country: this.CountryModel.get('iso'),
        url: this.presenter.status.get('indicators').data
      };

      // Mejorar
      $(document.querySelector('.reports-grid').firstChild).append(this.el);

      var $nextEl = $('#' + widgetId).find('.graph-container');

      if (this.presenter.status.get('indicators').type === 'line') {
        console.log($nextEl);
        new LineChartIndicator({el: $nextEl}).render(data, widgetId);
      }

      // if (this.data.type === 'pie') {
      //   this.$el.find('.graph-container .content').append(new PieChartIndicator().render(firstDataSetLink).el);
      // }

      return this;
    }

  });

  return WidgetView;

});
