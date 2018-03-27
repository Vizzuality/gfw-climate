define(
  [
    'backbone',
    'handlebars',
    'jquery',
    'underscore',
    'text!insights/templates/carbon-cycle/store-reservoir.handlebars'
  ],
  function(Backbone, Handlebars, $, _, tpl) {
    'use strict';

    var StoreReservoirView = Backbone.View.extend({
      el: '#store-reservoir',
      slides: [
        {
          id: 1,
          title: 'Tropical peatland forests',
          legend: '',
          img: '/assets/insights/carbon-cycle/slider1@2x.jpg'
        },
        {
          id: 2,
          title: 'Tropical primary forests',
          legend: '',
          img: '/assets/insights/carbon-cycle/slider2@2x.jpg'
        },
        {
          id: 3,
          title: 'Tropical secondary forests',
          legend: '',
          img: '/assets/insights/carbon-cycle/slider3@2x.jpg'
        },
        {
          id: 4,
          title:
            'Tropical dry forests Temperate forests (broadleaf and temperate)',
          legend: '',
          img: '/assets/insights/carbon-cycle/slider4@2x.jpg'
        }
      ],
      template: Handlebars.compile(tpl),

      initialize: function(settings) {
        this.settings = _.extend({}, this.defaults, settings);
        this.render();
      },

      render: function() {
        this.$el.html(this.template({ slides: this.slides }));
      }
    });

    return StoreReservoirView;
  }
);
