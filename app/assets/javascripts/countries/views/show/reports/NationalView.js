define([
  'backbone'
], function(Backbone) {

  var NationalView = Backbone.View.extend({

    el: '.gridgraphs--container',

    initialize: function(options) {
      this.widgets = options.widgets;
    },

    render: function() {
      this.$el.html('');

      this.widgets.forEach(function(widget) {
        widget.render();
        this.$el.addClass('national-grid').append(widget.el);
      }.bind(this));

      return this;
    }

  });

  return NationalView;

});
