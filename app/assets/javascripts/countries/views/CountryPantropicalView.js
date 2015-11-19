define([
  'backbone',
  'countries/views/pantropical/vis',

], function(Backbone) {

  'use strict';

  var CountryShowView = Backbone.View.extend({

    el: '.pantropical-vis',

    events: {
      'click #view_selection .btn' : 'switch_view',
      'click .minusy' : '_change_year',
      'change #year-drop-left' : '_set_year',
      'change #year-drop-right' : '_set_year'
    },

    initialize: function() {
      this.$years = $('#year-picker');
      //I can't find who is giving display:block to country tab...
      $('#vis').find('.country').hide();
    },

    switch_view: function(e) {
      $('#vis').find('.vis-tab').hide();
      $('#view_selection').find('.btn').removeClass('active');
      $(e.target).addClass('active');
      $('#vis').find('.' + $(e.target).attr('id')).show();
      toggle_view($(e.target).attr('id'));
    },


    _set_year: function(e){
      var element = e.target;
      var element2;
      if (element.id == "year-drop-left"){
        element2 = document.getElementById('year-drop-right');
        this.year_left = parseInt(element.options[element.selectedIndex].value);
        this.year_right = parseInt(element2.options[element2.selectedIndex].value);
        this._hideYears(element.id);
      }else if (element.id == "year-drop-right"){
        element2 = document.getElementById('year-drop-left');
        this.year_right = parseInt(element.options[element.selectedIndex].value);
        this.year_left = parseInt(element2.options[element2.selectedIndex].value);
        this._hideYears(element.id);
      }
      var year = [this.year_left, this.year_right];
      toggle_view('country', year);
    },

    _hideYears: function(elementID) {
      var $opositeSelector;
      var selectedYear;
      var condition;
      var value;
      var options;
      var self = this;

      if (elementID == "year-drop-left") {
        $opositeSelector = $('#year-drop-right');
        options = $opositeSelector.find('option');

        $.each(options, function() {
          value = this.value;
  
          if (value < self.year_left) {
            $(this).addClass('is-disabled');
            $(this).attr('disabled', true);

            // $opositeSelector.val(self.year_left)
          } else {
            $(this).removeClass('is-disabled');
            $(this).attr('disabled', false); 
          }
        })

      } else {
        $opositeSelector = $('#year-drop-left');
        options = $opositeSelector.find('option');

        $.each(options, function() {
          value = this.value;
          if (value > self.year_right) {
            $(this).addClass('is-disabled');
            $(this).attr('disabled', true);

            // $opositeSelector.val(self.year_right)
          } else {
            $(this).removeClass('is-disabled');
            $(this).attr('disabled', false); 
          }
        })
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
    }

  });

  return CountryShowView;

});
