define([
  'backbone',
  'handlebars',
  'nouislider'
], function(Backbone, Handlebars, nouislider) {

  var SlidersView = Backbone.View.extend({

    initialize: function(options) {
      this.initHeightSlider();
      this.initCrownSlider();
    },

    initHeightSlider: function(options) {
      this.heightSlider = document.getElementById('height-slider');
      nouislider.create(this.heightSlider, {
        start: 5,
        step: 1,
        animate: true,
        orientation: 'vertical',
        connect: [false, true],
        tooltips: {
      	  to: function ( value ) {
      		  return value + 'm';
      	  }
      	},
      	range: {
      		min: 0,
      		max: 10
      	}
      });
      this.heightSlider.setAttribute('disabled', true);
    }
    ,
    initCrownSlider: function(options) {
      this.crownSlider = document.getElementById('crown-cover-slider');
      nouislider.create(this.crownSlider, {
        start: 30,
        step: 10,
      	animate: true,
        connect: [false, true],
        tooltips: {
      	  to: function ( value ) {
      		  return '> ' + (100 - value) + '%';
      	  }
      	},
      	range: {
      		min: 0,
      		max: 100
      	}
      });
    }

  });

  return SlidersView;

});
