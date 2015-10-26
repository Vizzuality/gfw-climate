define([
  'backbone',
  'handlebars',
  'underscore',
  'text!countries/templates/country-national-grid.handlebars'
], function(Backbone, Handlebars, _, tpl) {

  var NationalView = Backbone.View.extend({

    el: '.reports-grid',

    template: Handlebars.compile(tpl),

    initialize: function(options) {
      this.widgets = options.widgets;
    },

    render: function() {
      this.$el.html(this.template);

      this.widgets.forEach(function(widget) {
        widget.render();
        this.$el.find('.national-grid').append(widget.el);
      }.bind(this));

      return this;
    }

  });

  return NationalView;

});
