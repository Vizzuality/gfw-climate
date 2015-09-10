define([
  'backbone',
  'handlebars'
], function(Bakcbone, Handlebars) {

  var SubNationalView = Backbone.View.extend({

    initialize: function(model) {
      this.model = model;
    },

    render: function() {
      return this.$el.html('<p>subnational</p>');
    }

  });

  return SubNationalView;

});
