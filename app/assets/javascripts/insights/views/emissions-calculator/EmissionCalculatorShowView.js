define(
  [
    'backbone',
    'underscore',
    'handlebars',
    'text!insights/templates/emissions-calculator/insights-emission-calculator-show.handlebars'
  ],
  function(Backbone, _, Handlebars, tpl) {
    'use strict';

    var EmisionCalculatorShow = Backbone.View.extend({
      el: '#insights',

      template: Handlebars.compile(tpl),

      initialize: function(settings) {
        this.defaults = _.extend({}, this.defaults, settings);
        this.$el.removeClass('is-loading');
        this.render();
      },

      render: function() {
        this.$el.html(
          this.template({
            id: this.defaults.id
          })
        );
      }
    });

    return EmisionCalculatorShow;
  }
);
