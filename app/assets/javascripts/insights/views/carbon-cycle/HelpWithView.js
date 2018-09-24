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
          title: 'Spend responsibly',
          content:
            'Divest from fossil fuels. Track your climate goals with Oroeco. Offset travel. Consume less. Spread the word.',
          img: '/assets/insights/carbon-cycle/last-block-img1@2x.jpg',
          bg: '/assets/insights/carbon-cycle/last-block-bg1@2x.jpg',
          isCurrent: true
        },
        {
          id: 2,
          title: 'Use your fork to vote for climate action',
          content:
            'Eat less meat, particularly beef. Waste less food. Buy products with certified labels e.g. RSPO. Forest500 company list. Demand transparency.',
          img: '/assets/insights/carbon-cycle/last-block-img3@2x.jpg',
          bg: '/assets/insights/carbon-cycle/last-block-bg3@2x.jpg'
        },
        {
          id: 3,
          title:
            'Support local and international campaigns to restore forest landscapes',
          content:
            'Choose a country. (Trillion Trees campaign, TNC, arbor day foundation, Sarah Mann’s person, Plant Your Future, Australia, China, Brazilian NGOs? Where else?',
          img: '/assets/insights/carbon-cycle/last-block-img2@2x.jpg',
          bg: '/assets/insights/carbon-cycle/last-block-bg2@2x.jpg'
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
