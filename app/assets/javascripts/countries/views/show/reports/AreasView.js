define([
  'backbone',
  'handlebars'
], function(Backbone, Handlebars) {

  var AreasView = Backbone.View.extend({

    initialize: function(model) {
      this.model = model;
    },

    render: function() {
      return this.$el.html('<p>areas</p>');
    }

  });

  return AreasView;

});
