define([
  'jquery',
  'backbone',
  'handlebars',
  'chosen',
  'views/ModalView',
  'widgets/presenters/DownloadWidgetPresenter',
  'text!widgets/templates/widget-download.handlebars',
], function($, Backbone, Handlebars, chosen, ModalView, DownloadWidgetPresenter, tpl) {

  var DownloadModalView = ModalView.extend({

    id: 'downloadWidgetModal',

    className: "modal modal-download",

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
      this.$el.on('change', '.js-select', _.bind(this.handleSelectChange, this ));
      this.$el.on('click', '.js-submit', _.bind(this.handleSubmit, this ));
      this.$el.on('click', '.js-back', _.bind(this.handleBack, this ));
    },

    unsetListeners: function(e) {
      this.$el.off('change', '.js-select', _.bind(this.handleSelectChange, this ));
      this.$el.off('click', '.js-submit', _.bind(this.handleSubmit, this ));
      this.$el.on('click', '.js-back', _.bind(this.handleBack, this ));
    },

    handleSelectChange: function(e) {
      var status = {};
      var target = e.currentTarget;
      status[target.dataset.attribute] = target.options[target.selectedIndex].value;
      this.presenter.updateStatus(status);
    },

    handleSubmit: function(e) {
      e.preventDefault();
      this.presenter.submit();
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
