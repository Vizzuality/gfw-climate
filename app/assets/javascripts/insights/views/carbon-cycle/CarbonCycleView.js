define(
  [
    'backbone',
    'handlebars',
    'jquery',
    'underscore',
    'snapsvg',
    'snapsvganim',
    'intersectionobserver',
    'scrollama',
    'views/shared/MouseScrollView',
    'insights/views/carbon-cycle/CarbonInForestView',
    'insights/views/carbon-cycle/StoreReservoirView',
    'insights/views/carbon-cycle/HelpWithView',
    'text!insights/templates/carbon-cycle/carbon-cycle.handlebars'
  ],
  function(
    Backbone,
    Handlebars,
    $,
    _,
    SnapSVG,
    SnapSVGAnim, // we need to import the library but then it is used as SVGAnim
    Intersectionobserver,
    Scrollama,
    MouseScrollView,
    CarbonInForestView,
    StoreReservoirView,
    HelpWithView,
    tpl
  ) {
    'use strict';

    var EmisionCalculatorIndex = Backbone.View.extend({
      el: '#insights',
      currentStep: 0,
      totalSteps: 0,

      defaults: {
        jsonUrl: '/assets/animations/carbon-cycle.json',
        fps: 45,
        width: 1200,
        height: 500
      },

      template: Handlebars.compile(tpl),

      initialize: function(settings) {
        this.settings = _.extend({}, this.defaults, settings);
        this.render();
        this.startModules();
        this.init();
      },

      render: function() {
        this.$el.html(this.template());
        this.totalSteps = this.$('.step').length - 1;
      },

      startModules: function() {
        this.carbonForest = new CarbonInForestView();
        this.storeReservoir = new StoreReservoirView();
        this.helpWith = new HelpWithView();
      },

      setListeners: function() {
        this.onResizeEvent = _.debounce(_.bind(this.onResize, this), 150);
        window.addEventListener('resize', this.onResizeEvent, false);
      },

      unsetListeners: function() {
        window.removeEventListener('resize', this.onResizeEvent, false);
        this.onResizeEvent = null;
      },

      cache: function() {
        this.graphicEl = this.$('.scroll__graphic');
        this.mouseScroll = this.$('#mouse-scroll-wrapper');
      },

      onResize: function() {
        if (this.scroller) {
          this.scroller.resize();
        }
      },

      initSvg: function(data) {
        this.svg = new SVGAnim(
          data,
          this.settings.width,
          this.settings.height,
          this.settings.fps
        );
        document.getElementById('animation').appendChild(this.svg.s.node);
      },

      handleStepEnter: function(data) {
        var step = parseInt(data.element.dataset.step, 10);
        if (this.currentStep !== step) {
          var scene = 'init';
          switch (step) {
            case 1:
              if (this.currentStep < step) {
                scene = 'init';
              } else {
                scene = 'sea_out';
              }
              break;
            case 2:
              if (this.currentStep < step) {
                scene = 'sea_in';
              } else {
                scene = 'forest_out';
              }
              break;
            case 3:
              scene = 'forest_in';
              break;
            default:
              break;
          }
          this.svg.mc.gotoAndPlay(scene);
          this.currentStep = step;
          data.element.classList.add('-current');
        }
      },

      handleStepExit: function(data) {
        var isFirst = data.direction === 'up' && data.index === 0;
        var isLast =
          data.direction === 'down' && data.index === this.totalSteps;
        if (!isFirst && !isLast) {
          data.element.classList.remove('-current');
        }
      },

      handleContainerEnter: function() {
        this.graphicEl.removeClass('-bottom');
        this.graphicEl.addClass('-fixed');
        this.mouseScroll.show();
      },

      handleContainerExit: function(response) {
        this.graphicEl.removeClass('-fixed');
        if (response.direction === 'down') {
          this.graphicEl.addClass('-bottom');
          this.mouseScroll.hide();
        }
      },

      initScroller: function() {
        this.scroller = Scrollama();
        this.scroller
          .setup({
            offset: 0.2,
            step: '.scroll__text .step',
            container: '.scroll',
            graphic: '.scroll__graphic'
          })
          .onStepEnter(this.handleStepEnter.bind(this))
          .onStepExit(this.handleStepExit.bind(this))
          .onContainerEnter(this.handleContainerEnter.bind(this))
          .onContainerExit(this.handleContainerExit.bind(this));
        this.cache();
        this.mouseScroll.hide();
      },

      getData: function() {
        return $.getJSON(this.settings.jsonUrl);
      },

      init: function() {
        this.scroll = new MouseScrollView({
          el: '#mouse-scroll-wrapper'
        });
        this.getData().done(data => {
          this.initSvg(data);
          this.initScroller();
          this.setListeners();
          this.$el.removeClass('is-loading');
        });
      },

      remove: function() {
        this.unsetListeners();
      }
    });

    return EmisionCalculatorIndex;
  }
);
