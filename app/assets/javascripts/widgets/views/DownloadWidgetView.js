define([
  'jquery',
  'backbone',
  'handlebars',
  'views/ModalView',
  'widgets/presenters/DownloadWidgetPresenter',
  'text!widgets/templates/widget-download.handlebars',
], function($, Backbone, Handlebars, ModalView, DownloadWidgetPresenter, tpl) {

  var DownloadModalView = ModalView.extend({

    id: 'downloadWidgetModal',

    className: "modal modal-download",

    template: Handlebars.compile(tpl),

    initialize: function(options) {
      // Init the parent view with the same scope
      this.constructor.__super__.initialize.apply(this);
      this.presenter = new DownloadWidgetPresenter(this);
      this.options = _.extend(this.defaults, options);
      this.setListeners();
      this._initVars();
      this.$body = $('body');
      this.$body.append(this.el);
    },

    setListeners: function(e) {
      this.$el.on('change', '.js-select', _.bind(this.handleSelectChange, this ));
      this.$el.on('click', '.js-submit', _.bind(this.handleSubmit, this ));
    },

    unsetListeners: function(e) {
      this.$el.off('change', '.js-select', _.bind(this.handleSelectChange, this ));
      this.$el.off('click', '.js-submit', _.bind(this.handleSubmit, this ));
    },

    handleSelectChange: function(e) {
      var status = {}
      var target = e.currentTarget;
      status[target.dataset.attribute] = target.options[target.selectedIndex].value;
      this.presenter.updateStatus(status);
    },

    handleSubmit: function(e) {
      e.preventDefault();
      this.presenter.submit();
    },

    render: function(data) {
      this.$el.html(this.template(data));
      return this;
    },

    remove: function() {
      this.unsetListeners();
    }

  });

  return DownloadModalView;

});
