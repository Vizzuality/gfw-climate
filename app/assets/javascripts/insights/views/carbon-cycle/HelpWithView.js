define(
  [
    'backbone',
    'handlebars',
    'jquery',
    'underscore',
    'text!insights/templates/carbon-cycle/help-with.handlebars'
  ],
  function(Backbone, Handlebars, $, _, tpl) {
    'use strict';

    var HelpWithIndex = Backbone.View.extend({
      el: '#help-with',
      slides: [
        {
          id: 1,
          title: 'Help restore forest',
          content:
            'Support local and international campaigns to restore forest landscapes. There are many organizations that actively reverse the effects of deforestation like Trillion Trees camapaign, TNC, arbor day foundation, Plant Your Future',
          img: '/assets/insights/carbon-cycle/last-block-img1@2x.jpg',
          bg: '/assets/insights/carbon-cycle/last-block-bg1@2x.jpg'
        },
        {
          id: 2,
          title: 'Help restore forest',
          content:
            'Support local and international campaigns to restore forest landscapes. There are many organizations that actively reverse the effects of deforestation like Trillion Trees camapaign, TNC, arbor day foundation, Plant Your Future',
          img: '/assets/insights/carbon-cycle/last-block-img2@2x.jpg',
          bg: '/assets/insights/carbon-cycle/last-block-bg2@2x.jpg'
        },
        {
          id: 3,
          title: 'Help restore forest',
          content:
            'Support local and international campaigns to restore forest landscapes. There are many organizations that actively reverse the effects of deforestation like Trillion Trees camapaign, TNC, arbor day foundation, Plant Your Future',
          img: '/assets/insights/carbon-cycle/last-block-img3@2x.jpg',
          bg: '/assets/insights/carbon-cycle/last-block-bg3@2x.jpg'
        }
      ],
      activeIndex: 1,
      template: Handlebars.compile(tpl),

      initialize: function(settings) {
        this.settings = _.extend({}, this.defaults, settings);
        this.render();
      },

      render: function() {
        this.$el.html(this.template({ slides: this.slides }));
      }
    });

    return HelpWithIndex;
  }
);
