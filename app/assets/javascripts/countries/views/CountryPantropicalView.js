define([
  'backbone',
  'countries/views/pantropical/PantropicalTotalEmissionsView',
  'countries/views/pantropical/vis',

], function(Backbone, PantropicalTotalEmissionsView) {

  'use strict';

  var CountryShowView = Backbone.View.extend({

    el: '.pantropical-vis',

    events: {
      'click #view_selection .btn' : 'switch_view',
      'click .minusy' : '_change_year'
    },

    initialize: function() {
      this.$years = $('#year-picker');
    },

    switch_view: function(e) {
      $('#vis').find('.vis-tab').hide();
      $('#view_selection').find('.btn').removeClass('active');
      $(e.target).addClass('active');
      $('#vis').find('.' + $(e.target).attr('id')).show();

      var viewId = $(e.target).attr('id');
      toggle_view(viewId);

      if(viewId === 'change') {
        $('#vis').addClass(viewId);
        this._renderChangeComponents();
      } else {
        $('#vis').removeClass();
      }
    },
    _change_year: function(e) {
      var $year = $(e.target);
      if ($year.hasClass('stop')) return;

      var current_y = ~~this.$years.find('.y').text();
      this.$years.find('.stop').removeClass('stop');
      if ($year.hasClass('plusy')) {
        //going a year on the FUTURE, MARTY
        this.$years.find('.y').text(current_y + 1);
        if (current_y + 1 >= ~~this.$years.data('maxyear')) {
          this.$years.find('.plusy').addClass('stop');
        }
      } else {
        //going a year on the past
        this.$years.find('.y').text(current_y - 1);
        if (current_y - 1 <= ~~this.$years.data('minyear')) {
          this.$years.find('.minusy').first().addClass('stop');
        }
      }
      toggle_view('change', ~~this.$years.find('.y').text())
    },

    _renderChangeComponents: function() {
      if(!this.totalEmissionsChart) {
        this.totalEmissionsChart = new PantropicalTotalEmissionsView();
      }
    }

  });

  return CountryShowView;

});
