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
          title: 'Help restore forest 1',
          content:
            'Support local and international campaigns to restore forest landscapes. There are many organizations that actively reverse the effects of deforestation like Trillion Trees camapaign, TNC, arbor day foundation, Plant Your Future',
          img: '/assets/insights/carbon-cycle/last-block-img1@2x.jpg',
          bg: '/assets/insights/carbon-cycle/last-block-bg1@2x.jpg'
        },
        {
          id: 2,
          title: 'Help restore forest 2',
          content:
            'Support local and international campaigns to restore forest landscapes. There are many organizations that actively reverse the effects of deforestation like Trillion Trees camapaign, TNC, arbor day foundation, Plant Your Future',
          img: '/assets/insights/carbon-cycle/last-block-img2@2x.jpg',
          bg: '/assets/insights/carbon-cycle/last-block-bg2@2x.jpg'
        },
        {
          id: 3,
          title: 'Help restore forest 3',
          content:
            'Support local and international campaigns to restore forest landscapes. There are many organizations that actively reverse the effects of deforestation like Trillion Trees camapaign, TNC, arbor day foundation, Plant Your Future',
          img: '/assets/insights/carbon-cycle/last-block-img3@2x.jpg',
          bg: '/assets/insights/carbon-cycle/last-block-bg3@2x.jpg'
        }
      ],
      activeIndex: 0,

      template: Handlebars.compile(tpl),

      events: {
        'change input': 'onInputChange'
      },

      initialize: function(settings) {
        this.settings = _.extend({}, this.defaults, settings);
        this.render();
      },

      render: function() {
        this.$el.html(
          this.template({
            slides: this.slides,
            bgImage: this.slides[this.activeIndex].bg,
            activeTitle: this.slides[this.activeIndex].title,
            activeContent: this.slides[this.activeIndex].content
          })
        );
      },

      onInputChange: function(hey) {
        var self = this;
        this.activeIndex = parseInt(hey.currentTarget.value, 10) || 0;
        this.slides = _.map(this.slides, function(slide, index) {
          slide.isCurrent = self.activeIndex === index;
          return slide;
        });
        this.render();
      }
    });

    return HelpWithIndex;
  }
);
