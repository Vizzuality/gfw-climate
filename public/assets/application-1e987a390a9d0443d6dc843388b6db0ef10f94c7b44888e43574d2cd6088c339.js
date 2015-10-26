/**
 * Application entry point.
 */

require([
  'jquery',
  'underscore',
  'Class',
  'backbone',
  '_string',
  'home/views/sliderView'
], function($, _, Class, Backbone, _string, sliderView) {

  'use strict';

  var HomePage = Class.extend({

    $el: $('body'),

    init: function() {
      this._initViews();
    },

    /**
     * Initialize the map by starting the history.
     */
    _initApp: function() {
      if (!Backbone.History.started) {
        Backbone.history.start({pushState: true});
      }
    },

    /**
     * Initialize Application Views.
     * CAUTION: Don't change the order of initanciations if
     * you are not completely sure.
     */
    _initViews: function() {
      new sliderView();
    }

  });

  new HomePage();

});
