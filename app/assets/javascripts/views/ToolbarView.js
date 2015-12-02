/**
 * The Footer view.
 */
define([
  'jquery',
  'backbone',
  'views/ShareView',

], function($,Backbone,ShareView) {

  'use strict';

  var ToolbarView = Backbone.View.extend({

    el: '#toolbarView',

    events: {
      'click .btn-share' : 'share',
      'click .btn-save' : 'save'
    },

    initialize: function() {
    },

    // EVENTS
    share: function(e) {
      var shareView = new ShareView().share(e);
      $('body').append(shareView.el);
    },

    save: function(e) {
      return false;
    },

  });

  return ToolbarView;

});
