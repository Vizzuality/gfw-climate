define(['backbone'], function(Backbone) {
  'use strict';
  var MouseScrollView = Backbone.View.extend({
    el: '#mouse-scroll',
    template:
      '<div class="mouse-scroll"><span class="wheel"></span><span class="arrow arrow1"></span> <span class="arrow arrow2"></span></div>',

    initialize: function() {
      this.render(this.params);
    },

    render: function() {
      this.$el.html(this.template);
      return this;
    }
  });
  return MouseScrollView;
});
