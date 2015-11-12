/**
 * The Launch counter view.
 */
define([
  'jquery',
  'backbone',
], function($,Backbone) {

  'use strict';

  var LaunchCounterView = Backbone.View.extend({

    el: '#countdown',

    initialize: function() {
      this.render();
    },

    getCountDown: function() {
      return ~~(new Date (this.getFinalDate() - this.getCurrentDate()) / 86400000);
    },

    getFinalDate: function() {
      var date = '01 01 2016'
      return new Date(date);
    },

    getCurrentDate: function() {
      return new Date();
    },

    render: function() {
      this.$el.html(this.getCountDown());
    }

  });

  return LaunchCounterView;

});
