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
      $('#vis').find('.vis-tab').hide();
      $('#view_selection').find('.btn').removeClass('active');
      $(e.target).addClass('active');
      toggle_view($(e.target).attr('id'));
      $('#vis').find('.' + $(e.target).attr('id')).show();
    }

  });

  return CountryShowView;

});
