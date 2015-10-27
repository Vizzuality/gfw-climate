define([
  'backbone'
], function(Backbone) {

  'use strict';

  var IndicatorView = Backbone.View.extend({

    events: {},

    initialize: function(setup) {
      this.$el.addClass(setup.className);
    },

    render: function() {}


  });

  return IndicatorView;

})
