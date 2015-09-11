define([
  'backbone',
  'handlebars',
  'text!countries/templates/country-areas-grid.handlebars'
], function(Backbone, Handlebars, tpl) {

  var AreasView = Backbone.View.extend({

    el: '.reports-grid',

    template: Handlebars.compile(tpl),

    initialize: function(model) {
      this.model = model;
    },

    render: function() {
      this.$el.html(this.template);

      return this.$el.html();
    }

  });

  return AreasView;

});
