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
      this.$body.append(this.el);
    },

    render: function() {
      this.$el.html(this.template());
      return this;
    }

  });

  return SourceModalView;

});
