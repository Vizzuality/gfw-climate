define([
  'backbone',
  'countries/views/pantropical/vis',

], function(Backbone,d3) {

  'use strict';

  var CountryShowView = Backbone.View.extend({

    el: '.pantropical-vis',

    events: {
      'click #view_selection .btn' : 'switch_view'
    },

    initialize: function() {
    },

    switch_view: function(e) {
      $('#view_selection').find('.btn').toggleClass('active');
      toggle_view($(e.target).attr('id'));
    }

  });

  return CountryShowView;

});
