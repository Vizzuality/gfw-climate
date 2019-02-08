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
          title: 'Restore carbon in trees and soil',
          content: 'Lorem ipsum - waiting for text.',
          img: '/assets/insights/carbon-cycle/last-block-img1@2x.jpg',
          bg: '/assets/insights/carbon-cycle/last-block-bg1@2x.jpg',
          isCurrent: true
        },
        {
          id: 2,
          title: 'Eat less meat',
          content:
            'What you put on your plate matters a lot more than where it came from. Meat and dairy production requires more land than plant-based proteins like beans and lentils. In particular, reducing your beef consumption is essential to achieving climate goals. This is because beef requires more land and generates more emissions per unit of protein than any other commonly consumed food.; cutting it in half can halve your dietary carbon footprint and reduce consumer demand for the products that cause deforestation.',
          img: '/assets/insights/carbon-cycle/last-block-img3@2x.jpg',
          bg: '/assets/insights/carbon-cycle/last-block-bg3@2x.jpg'
        },
        {
          id: 3,
          title: 'Reduce food waste',
          content:
            'By simply reducing your food waste – and only buying what you’ll actually eat - you can eliminate about xxxx tons of CO2 emissions every year. Each time you make a conscious decision to reduce your food waste, all the energy involved to grow, transport and refrigerate that wasted food can be saved from going into the atmosphere. This means less agricultural pressure on land, leaving more room for forests.',
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
