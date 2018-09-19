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
          title: 'Tropical dry forest',
          legend: '65 t C/ha',
          img: '/assets/insights/carbon-cycle/tropical-dry@2x.jpg'
        },
        {
          id: 2,
          title: 'Tropical Rainforest',
          legend: '150 t C/ha',
          img: '/assets/insights/carbon-cycle/tropical-rainforest@2x.jpg'
        },
        {
          id: 3,
          title: 'Temperate forest',
          legend: '67 t C/ha',
          sublegend:
            'Average of oceanic (90 t C/ha), continental (60 t C/ha) and mountain forest (50 t C/ha)',
          img: '/assets/insights/carbon-cycle/temperate-forest@2x.jpg'
        },
        {
          id: 4,
          title: 'Boreal forest',
          legend: '20 t C/ha',
          sublegend:
            'Average of coniferous (25 t C/ha) and mountain forest (15 t C/ha) (edited)',
          img: '/assets/insights/carbon-cycle/boreal-forest@2x.jpg'
        },
        {
          id: 5,
          title: 'Subtropical humid forest',
          legend: '110 t C/ha',
          img: '/assets/insights/carbon-cycle/subtropical-humid@2x.jpg'
        },
        {
          id: 6,
          title: 'Subtropical dry forest',
          legend: '65 t C/ha',
          img: '/assets/insights/carbon-cycle/subtropical-dry@2x.jpg'
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
