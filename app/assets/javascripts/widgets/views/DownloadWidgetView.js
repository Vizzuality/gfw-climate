define([
  'jquery',
  'enquire',
  'backbone',
  'handlebars',
  'chosen',
  'views/ModalView',
  'widgets/presenters/DownloadWidgetPresenter',
  'text!widgets/templates/widget-download.handlebars',
], function($, enquire, Backbone, Handlebars, chosen, ModalView, DownloadWidgetPresenter, tpl) {

  var DownloadModalView = ModalView.extend({

    id: 'downloadWidgetModal',

    className: "modal modal-download is-large",

    template: Handlebars.compile(tpl),

    initialize: function(options) {
      // Init the parent view with the same scope
      this.constructor.__super__.initialize.apply(this);
      this.presenter = new DownloadWidgetPresenter(this);
      this.options = _.extend(this.defaults, options);
      this.setMobile();
      this.setListeners();
      this._initVars();
      this.$body = $('body');
      this.$body.append(this.el);
    },

    setMobile: function() {
       enquire.register("screen and (max-width:"+window.gfw.config.GFW_MOBILE+"px)", {
        match: _.bind(function(){
          this.mobile = true;
        },this)
      });

      enquire.register("screen and (min-width:"+window.gfw.config.GFW_MOBILE+"px)", {
        match: _.bind(function(){
          this.mobile = false;
        },this)
      });
    },

    initChosen: function() {
      this.$selects = this.$el.find('.chosen-select');
      this.$selects.chosen({
        disable_search: true
      });
    },

    setListeners: function(e) {
      this.$el.on('click', '.js-submit', _.bind(this.handleSubmit, this ));
      this.$el.on('click', '.js-back', _.bind(this.handleBack, this ));
    },

    unsetListeners: function(e) {
      this.$el.off('click', '.js-submit', _.bind(this.handleSubmit, this ));
      this.$el.on('click', '.js-back', _.bind(this.handleBack, this ));
    },

    handleSubmit: function(e) {
      e.preventDefault();
      var indicators = this.$('#download-indicators').val();
      var data = {
        indicators: indicators || [],
        start_date: this.$('#download-start-date').val(),
        end_date: this.$('#download-end-date').val(),
        thresh: this.$('#download-thresh').val()
      };
      this.presenter.submit(data);
    },

    handleBack: function(index){
      this.presenter.goBack();
    },

    render: function(data) {
      this.$el.html(this.template(data));
      if (!this.mobile) {
        this.initChosen();
      }
      return this;
    },

    remove: function() {
      this.unsetListeners();
    }

  });

  return DownloadModalView;

});
