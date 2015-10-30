define([
  'backbone',
  'handlebars',
  'widgets/presenters/WidgetPresenter',
  'widgets/views/TabView',
  'text!widgets/templates/widget.handlebars',
], function(Backbone, Handlebars, WidgetPresenter, TabView, tpl) {

  'use strict';

  var WidgetView = Backbone.View.extend({

    template: Handlebars.compile(tpl),

    events: {
      'click .close'   : '_close',
      'click .info'    : '_info',
      'click .share'   : '_share',
      'click .tab-li'  : '_changeTab'
    },

    initialize: function(setup) {
      this.presenter = new WidgetPresenter(this, setup);
    },

    /**
     * Fetch MODEL
     * @param  {function} callback
     */
    _loadMetaData: function(callback) {
      this.presenter.model.fetch().done(callback.bind(this));
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

      this.setTab();

      return this;
    },

    cacheVars: function() {
      this.$tabgrid = this.$el.find('.tab-ul');
      this.$tablink = this.$el.find('.tab-li');
      this.$tabcontent = this.$el.find('.tab-content');
    },

    /**
     * SETTERS
     */
    setTab: function() {
      var position = this.presenter.status.get('tabs').position;
      // UI
      this.$tablink.removeClass('is-selected');
      this.$tabgrid.find('.tab-li[data-position="' + position + '"]').addClass('is-selected');
      // Check if the tab exist to remove all the events and data
      if (this.tab) {
        this.tab.undelegateEvents();
        this.tab.$el.removeData().unbind();
        (!!this.tab.indicator) ? this.tab.indicator.destroy() : null;
      }
      // NEW TAB
      this.tab = new TabView({
        el: this.$tabcontent,
        widget: this,
        model: {
          location: this.presenter.model.get('location'),
          data: _.findWhere(this.presenter.model.get('tabs'), {position: position}),
          indicators: _.where(this.presenter.model.get('indicators'), {tab: position}),
          // Compare model params
          location_compare: this.presenter.model.get('location_compare'),
          slug_compare: this.presenter.model.get('slug_compare'),
        },
        status: this.presenter.status.toJSON()
      });

    },

    /**
     * EVENTS
     * @param  {click event} e
     */
    _changeTab: function(e) {
      this.presenter.changeTab($(e.currentTarget).data('position'));
    },

    changeStatus: function(status) {
      this.presenter.changeStatus(status);
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
