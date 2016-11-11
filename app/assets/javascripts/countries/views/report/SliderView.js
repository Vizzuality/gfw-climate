define([
  'backbone',
  'handlebars',
  'nouislider'
], function(Backbone, Handlebars, nouislider) {

  var SliderView = Backbone.View.extend({

    initialize: function(options) {
      nouislider.create(this.el, {
        start: 70,
      	animate: true,
      	range: {
      		min: 0,
      		max: 100
      	}
      });
    }

  });

  return SliderView;

});
