define([
  'backbone',
  'handlebars',
  'text!countries/templates/country-subnational-grid.handlebars'
], function(Bakcbone, Handlebars, tpl) {

  var SubNationalView = Backbone.View.extend({

    el: '.reports-grid',

    template: Handlebars.compile(tpl),

    initialize: function(model) {
      this.model = model;
    },

    render: function() {
      this.$el.html(this.template);

      return this.$el.html()
    }

  });

  return SubNationalView;

});
