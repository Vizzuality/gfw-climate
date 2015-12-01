/**
 * Application entry point.
 */
require([
  'jquery',
  'underscore',
  'Class',
  'backbone',
  '_string',
  'home/views/sliderView',
  'home/views/launchCounter',
  'views/SourceWindowView',
  'views/SidebarNavView'
], function($, _, Class, Backbone, _string, sliderView, LaunchCounterView, SourceWindowView, SidebarNavView) {

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
      new SourceWindowView();
      new LaunchCounterView();
      new sliderView();
      new SidebarNavView();
    }

  });

  new HomePage();

});
