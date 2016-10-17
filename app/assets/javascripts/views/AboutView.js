define([
  'jquery',
  'backbone',
  'views/SidebarNavView'
], function($,Backbone, SidebarNavView) {

  'use strict';

  var AboutView = Backbone.View.extend({

    el: '.content-static',

    events: {
      'click .downloadDoc': 'onDownloadDoc'
    },

    initialize: function(settings) {
      if (!this.el) {
        return;
      }

      var opts = settings && settings.options ? settings.options : {};
      this.options = _.extend({}, this.defaults, opts);

      this.initModules();
    },

    initModules: function(e) {
      new SidebarNavView();
    },

    // UI events
    onDownloadDoc: function(e) {
      ga('send', 'event', 'About', 'Download',$(e.target).data('type'));
      return true;
    }

  });

  return AboutView;
});
