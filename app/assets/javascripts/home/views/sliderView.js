/**
 * The Slide view.
 */
define([
  'jquery',
  'backbone',
  'underscore',
  'mps',
  'enquire',
  'handlebars',
  'slick'
], function($,Backbone, _,mps, enquire, Handlebars, slick) {

  'use strict';

  // SLIDER
  var SlideView = Backbone.View.extend({

    el: '.main-slider',

    events: {
      'click #get-started' : 'getStarted',
      'click #go-to-apps' : 'goToApps',
      'click .gotomap' : 'gotoMap',
      'click .feature-slider .slick-dots li': '_onSliderClick',
      'mouseenter .feature-slider .slick-dots li': '_onSliderFeatureHighlight',
      'mouseleave .feature-slider .slick-dots li': '_onSliderFeatureUnHighlight'
    },

    initialize: function() {
      //Init
      this.$getStarted = $('#get-started');

      //Inits
      this._slickSliderMain();
      this._slickSliderFeature();
    },

    _slickSliderMain: function() {
      this.mainSlider = this._initSlicK('.home-slider', 500, 3000);
    },

    _slickSliderFeature: function() {
      this.featureSliderStopped = false;
      this.featureSlider = this._initSlicK('.feature-slider', 500, 8000);
    },

    /**
     * Pauses the feature slider when the mouse
     * its on top of a slick dot
     */
    _onSliderFeatureHighlight: function() {
      this.featureSlider.slick('slickPause');
    },

    /**
     * Plays the feature slider when the mouse
     * leaves a slick dot
     */
    _onSliderFeatureUnHighlight: function() {
      if (!this.featureSliderStopped) {
        this.featureSlider.slick('slickPlay');
      }
    },

    /**
     * Pauses the feature slider when the mouse
     * its on top of a slick dot
     */
    _onSliderClick: function() {
      this.featureSliderStopped = true;
      this.featureSlider.slick('slickPause');
    },

    _initSlicK: function(el, speed, autoSpeed) {
      var slick = $(el).slick({
        infinite: true,
        speed: speed,
        autoplay: true,
        autoplaySpeed: autoSpeed,
        slide: 'li',
        fade: true,
        cssEase: 'linear',
        dots: true,
        pauseOnDotsHover: true,
        pauseOnHover: false,
        arrows: false,

        responsive: [
          {
            breakpoint: 850,
            speed: 250,
            settings: {
              fade: false,
              cssEase: 'ease-out'
            }
          }
        ]
      });

      return slick;
    },

    getStarted: function(e){
      e.stopPropagation();
      $(e.currentTarget).toggleClass('active');
    },

    /**
     * Closes submenu tooltip
     * Check the click target is not the dialog itself.
     *
     * @param  {Object} e Event
     */
    _onHtmlClick: function(e) {
      if (!$(e.target).hasClass('submenu-tooltip') && this.$getStarted.hasClass('active')) {
        this.$getStarted.removeClass('active');
      }
    },


    goToApps: function(e){
      e.preventDefault();
      var posY = $($(e.currentTarget).attr('href')).offset().top;
      $('html,body').animate({scrollTop: posY},500);
    },

    gotoMap: function(e) {
      e.preventDefault();
      e.stopPropagation();

      var $target = $(e.target);

      if (!$(e.target).hasClass('gotomap')) {
        $target = $(e.target).parent();
      }

      if ($target.data('dialog')) {
        var dialog = JSON.stringify(
        {
          "display": true,
          "type" : $target.data('dialog')
        });

        sessionStorage.setItem('DIALOG', dialog);
      }
      ga('send', 'event', 'Get Started', 'Click', $target.data('ga'));
      window.setTimeout(function(){location.assign($target.attr('href'));20});
    }

  });

  return SlideView;

});
