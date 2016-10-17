define([
  'jquery',
  'backbone',
], function($,Backbone) {

  'use strict';

  var AboutView = Backbone.View.extend({

    el: '.content-static',

    events: {
      'click .downloadDoc': 'onDownloadDoc'
    },

    model: new (Backbone.Model.extend()),


    initialize: function(settings) {
      if (!this.el) {
        return;
      }

      var opts = settings && settings.options ? settings.options : {};
      this.options = _.extend({}, this.defaults, opts);
    },

    // UI events
    onDownloadDoc: function(e) {
      ga('send', 'event', 'About', 'Download',$(e.target).data('type'));
      return true;
    }

  });

  return AboutView;
});
