define([
  'backbone',
  'handlebars',
  'enquire',
  'widgets/presenters/WidgetPresenter',
  'widgets/views/TabView',
  'text!widgets/templates/widget.handlebars',
], function(Backbone, Handlebars, enquire, WidgetPresenter, TabView, tpl) {

  'use strict';

  var WidgetView = Backbone.View.extend({

    template: Handlebars.compile(tpl),

    events: {
      'click .close'   : '_close',
      'click .info'    : '_info',
      'click .share'   : '_share',
      'click .tab-li'  : '_changeTab',
      'change .tab-selector'  : '_changeTab'
    },

    initialize: function(setup) {
      this.presenter = new WidgetPresenter(this, setup);

      enquire.register("screen and (max-width:"+window.gfw.config.GFW_MOBILE+"px)", {
        match: _.bind(function(){
          this.mobile = true;
          this.render();
        },this)
      });

      enquire.register("screen and (min-width:"+window.gfw.config.GFW_MOBILE+"px)", {
        match: _.bind(function(){
          this.mobile = false;
          this.render();
        },this)
      });
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
        slug: this.presenter.model.get('slug'),
        tabs: this.presenter.model.get('tabs'),
        name: this.presenter.model.get('name'),
        isMobile: this.mobile
      }));

      this.cacheVars();

      this.setTab();

      return this;
    },

    cacheVars: function() {
      this.$tabgrid = this.$el.find('.tab-ul');
      this.$tablink = this.$el.find('.tab-li');
      this.$tabcontent = this.$el.find('.tab-content');
      this.$tabSelector = this.$el.find('.tab-selector');
    },

    /**
     * SETTERS
     */
    setTab: function() {
      var position = this.presenter.status.get('tabs').position;
      // UI
      this.$tablink.removeClass('-selected');
      
      if (this.mobile) {
        //Mobile
        this.$tabgrid.find('.tab-li[data-position="' + position + '"]').attr('selected');
        this.$tabgrid.find('.tab-li[data-position="' + position + '"]').addClass('-selected');

        this.$tabSelector.val(position);
      } else {
        this.$tabgrid.find('.tab-li[data-position="' + position + '"]').addClass('-selected');
      }

      // Check if the tab exist to remove all the events and data
      if (!!this.tab) {
        this.tab.destroy();
      }
      // NEW TAB
      this.tab = new TabView({
        el: this.$tabcontent,
        widget: this,
        model: {
          location: this.presenter.model.get('location'),
          data: _.findWhere(this.presenter.model.get('tabs'), {'position': ~~position}),
          indicators: _.where(this.presenter.model.get('indicators'), {'tab': ~~position}),
          slugw: this.presenter.model.get('slugw'),
          // Compare model params
          location_compare: this.presenter.model.get('location_compare'),
          slugw_compare: this.presenter.model.get('slugw_compare'),
        },
        status: this.presenter.status.toJSON()
      });
    },

    /**
     * EVENTS
     * @param  {click event} e
     */
    _changeTab: function(e) {
      if (this.mobile) {
        //Mobile
        this.presenter.changeTab($(e.currentTarget).val());
      } else {
        this.presenter.changeTab($(e.currentTarget).data('position'));
      }
    },

    changeStatus: function(status) {
      this.presenter.changeStatus(status);
    },

    _close: function(e) {
      ga('send', 'event', 'Widget','Delete',this.presenter.model.get('name'));
      e && e.preventDefault();
      this.presenter.deleteWidget();
    },

    _info: function(e) {},

    _share: function(e) {},

    destroy: function() {
      if (!!this.tab) {
        this.tab.destroy();
      }
      this.presenter.destroy();
      this.undelegateEvents();
      this.$el.removeData().unbind();
      this.$el.remove();
      this.remove();
      Backbone.View.prototype.remove.call(this);
    }

  });

  return WidgetView;

});
