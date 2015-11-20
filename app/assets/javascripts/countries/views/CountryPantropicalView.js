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
      // 'click .minusy' : '_change_year',
      'input #year-picker' : '_change_year',
      'click .minusy' : '_change_year',
      'change #year-drop-left' : '_set_year',
      'change #year-drop-right' : '_set_year',
      'click .btn-submit' : '_submityears',
    },

    initialize: function() {
      //I can't find who is giving display:block to country tab...
      $('#vis').find('.country').hide();
      this._cacheVars();
    },

    _cacheVars: function() {
      this.$years = $('#year-picker');
      this.yearsPickerLabel = $('#year-picker-label');
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

    _submityears: function() {
      toggle_view('country', this.year);
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
      this.year = [this.year_left, this.year_right];
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
      var year = e.currentTarget.value;
  
      this.yearsPickerLabel.val(year);
      this._setLabelPosition(year);

      toggle_view('change', year)
    },

    _setLabelPosition: function(year) {
      var width = this.$years.width();
      var newPlace;

      // Figure out placement percentage between left and right of input
      var newPoint = (year - this.$years.attr("min")) / (this.$years.attr("max") - this.$years.attr("min"));

      if (newPoint < 0) { newPlace = 0; }
         else if (newPoint > 1) { newPlace = width; }
         else { newPlace = width * newPoint; }

      $('#year-picker-label').css({ left: newPlace });
    },

    _renderChangeComponents: function() {
      if(!this.totalEmissionsChart) {
        this.totalEmissionsChart = new PantropicalTotalEmissionsView();
      }
    }

  });

  return CountryShowView;

});
