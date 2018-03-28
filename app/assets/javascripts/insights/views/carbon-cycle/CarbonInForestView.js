define(
  [
    'backbone',
    'handlebars',
    'jquery',
    'underscore',
    'intersectionobserver',
    'scrollama',
    'text!insights/templates/carbon-cycle/carbon-in-forest.handlebars'
  ],
  function(Backbone, Handlebars, $, _, Intersectionobserver, Scrollama, tpl) {
    'use strict';

    var StoreReservoirView = Backbone.View.extend({
      el: '#carbon-in-forest',
      template: Handlebars.compile(tpl),
      totalSteps: 0,
      events: {
        'click .js-forest-list': 'onListClick'
      },

      initialize: function(settings) {
        this.settings = _.extend({}, this.defaults, settings);
        this.init();
      },

      init: function() {
        this.render();
        this.cache();
        this.initScroller();
      },

      cache: function() {
        this.graphicEl = this.$('.carbon-forest-graphic');
      },

      onListClick: function(e) {
        var step = e.currentTarget.dataset.step;
        console.info('Clicked on ', step);
      },

      handleStepEnter: function(e) {
        this.$('.carbon-forest-image-' + e.index).show();
        var previousIndex = e.index - 1;
        if (e.direction === 'up') {
          previousIndex = e.index + 1;
        }
        this.$('.carbon-forest-image-' + previousIndex).hide();
      },

      handleContainerEnter: function() {
        this.graphicEl.removeClass('-bottom');
        this.graphicEl.addClass('-fixed');
      },

      handleContainerExit: function(response) {
        this.graphicEl.removeClass('-fixed');
        if (response.direction === 'down') {
          this.graphicEl.addClass('-bottom');
        }
      },

      setGraphHeight: function() {
        this.$('.carbon-forest-graphic').height(window.innerHeight);
        this.scroller.resize();
      },

      initScroller: function() {
        this.scroller = Scrollama();
        this.scroller
          .setup({
            container: '.carbon-forest',
            graphic: '.carbon-forest-graphic',
            text: '.carbon-forest-text',
            step: '.carbon-forest-section.step'
          })
          .onStepEnter(this.handleStepEnter.bind(this))
          .onContainerEnter(this.handleContainerEnter.bind(this))
          .onContainerExit(this.handleContainerExit.bind(this));
        this.setGraphHeight();
      },

      render: function() {
        this.$el.html(this.template());
        this.totalSteps = this.$('.carbon-forest-section.step').length - 1;
      }
    });

    return StoreReservoirView;
  }
);
