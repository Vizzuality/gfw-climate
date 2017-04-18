define([
  'backbone',
  'handlebars',
  'text!insights/templates/emissions-calculator/insights-emission-calculator-index.handlebars',
], function(Backbone, Handlebars, tpl) {

  'use strict';

  var EmisionCalculatorIndex = Backbone.View.extend({

    el: '#insights',

    template: Handlebars.compile(tpl),

    initialize: function(settings) {
      this.defaults = _.extend({}, this.defaults, settings);
      this.$el.removeClass('is-loading');
      this.render();
    },

    render: function() {
      this.$el.html(this.template({}));
     }

  });

  return EmisionCalculatorIndex;

});
