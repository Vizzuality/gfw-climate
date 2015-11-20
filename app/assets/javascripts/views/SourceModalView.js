define([
  'jquery',
  'backbone',
  'underscore',
  'handlebars',
  'views/ModalView',
  'text!templates/sourceModal.handlebars'

], function($,Backbone, _, Handlebars, ModalView, tpl) {

  var SourceModalView = ModalView.extend({

    id: '#sourceModal',

    className: "modal",

    template: Handlebars.compile(tpl),

    initialize: function() {
      // Inits
      this.constructor.__super__.initialize.apply(this);
      this.render();
      this._initVars();
      this.setListeners();
      this.$body.append(this.el);
    },

    setListeners: function() {
      this.$body.on('click', '.source', _.bind(this.sourceClick, this ));
    },

    render: function() {
      this.$el.html(this.template());
      return this;
    },

    sourceClick: function(e) {
      e && e.preventDefault() && e.stopPropagation();
      this.show($(e.currentTarget).data('source'));
    }

  });

  return SourceModalView;

});
