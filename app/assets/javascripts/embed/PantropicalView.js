define([
  'backbone',
  'embed/views/pantropical/PantropicalTotalEmissionsView',
  'embed/views/pantropical/vis',
], function(Backbone, PantropicalTotalEmissionsView) {

  'use strict';

  var CountryShowView = Backbone.View.extend({

    el: '.pantropical-vis',

    events: {
      'click #view_selection .btn'  : 'switch_view',
      'input #year-picker'          : '_change_year',
      'click .minusy'               : '_change_year',
      'change #year-drop-left'      : '_set_year',
      'change #year-drop-right'     : '_set_year',
      'click .btn-submit'           : '_submityears',
      'click #play-pause'           : '_play_pause',
      'click #share-options-btn'    : '_toggleShareMenu',
      'click .share-options-list a' : '_shareToSocial'
    },

    initialize: function() {
      //I can't find who is giving display:block to country tab...
      var currentTab = location.search.split('tab=')[1];
      $('#vis').find('.country').hide();
      this._cacheVars();
      this._setRankingAverage();

      if (!!currentTab) {
        window.setTimeout(function(){
          $('#' + currentTab).trigger('click');
        },50)
      }
    },

    _setRankingAverage: function() {
      $('#year-drop-right').val('2013');
    },

    _cacheVars: function() {
      this.$years             = $('#year-picker');
      this.$yearsPickerLabel  = $('#year-picker-label');
      this.$play_pause        = $('#play-pause');
      this.$playBtn           = this.$play_pause.find('.play');
      this.$pauseBtn          = this.$play_pause.find('.pause');
      this.$progressbar       = $('.progress-year');
      this.progression        = 0;
      this.ticks              = ~~this.$years.attr("max") - ~~this.$years.attr("min");
    },

    switch_view: function(e) {
      $('#vis').find('.vis-tab').hide();
      $('#view_selection').find('.btn').removeClass('active');
      $('.country-legend-container').addClass('is-hidden');
      $(e.target).addClass('active');
      $('#vis').find('.' + $(e.target).attr('id')).show();

      var viewId = $(e.target).attr('id');
      toggle_view(viewId);

      this._updateUrl(viewId);

      if(viewId === 'change') {
        $('#vis').addClass(viewId);
        $('.country-legend-container').removeClass('is-hidden');
        $('#vis').find('#svg_vis:last-child').css({
          'height': 475
        });
        this._renderChangeComponents();
      }
      return false;
    },

    _updateUrl: function(viewId) {
      history.pushState('', document.title, window.location.origin + window.location.pathname + '?tab=' + viewId);
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

    _change_year: function(e, year_moved) {
      var year = (e) ? e.currentTarget.value : year_moved;

      this.$yearsPickerLabel.val(year);
      this._setLabelPosition(year);

      toggle_view('change', year, true)
    },

    _setLabelPosition: function(year) {
      var width = this.$years.width();
      var newPlace;

      // Figure out placement percentage between left and right of input
      var newPoint = (year - this.$years.attr("min")) / (this.$years.attr("max") - this.$years.attr("min"));

      if (newPoint < 0) { newPlace = 0; }
         else if (newPoint > 1) { newPlace = width; }
         else { newPlace = width * newPoint; }

      this.$yearsPickerLabel.css({ left: newPlace });
    },

    _renderChangeComponents: function() {
      if(!this.totalEmissionsChart) {
        this.totalEmissionsChart = new PantropicalTotalEmissionsView();
      }
    },

    _play_pause: function(e) {
      var target = (e) ? $(e.target) : this.$play_pause;
      if (!!e && $(e.target).hasClass('stop')) {
        // the user has previously stopped the movement and wants to continue: ALLOW
        target.removeClass('stop')
      }

      if ((!target.hasClass('is-playing') || ! !!e) && !target.hasClass('stop')) {
        // the user wants to start the animation
        // the animation hasn't started yet or well it hasn't been called by the user but by this same function
        target.addClass('is-playing');
        var that = this;

        this.$playBtn.addClass('is-hidden');
        this.$pauseBtn.removeClass('is-hidden');


        window.setTimeout(function() {
          that.progression += 100 / that.ticks;

          var year = ~~that.$yearsPickerLabel.val() + 1;
          if (year <= that.$years.attr("max")) {
            that._change_year(null, year); // update label
            that.$years.val(year);         // update range position
            that.$progressbar.css({
              'left': that.progression + '%'
            });
            that._play_pause();            // paint next year
            if (year == that.$years.attr("max")) {
              that.progression = 0;
              // target.addClass('stop');
            }
          }

        },1500)
      } else {
        // the user wants to stop the animation or the animation is finishing
        if (~~this.$yearsPickerLabel.val() <= ~~this.$years.attr('max'))
          this._change_year(null, this.$years.attr("min")); // update label
          this.$years.val(this.$years.attr("min"));         // update range position
          this.progression = 0;
          this.$playBtn.removeClass('is-hidden');
          this.$pauseBtn.addClass('is-hidden');
          this.$progressbar.css({
            'left': this.progression
          });
          target.removeClass('is-playing').addClass('stop');
      }
    },

    _toggleShareMenu: function(e) {
      $('.share-options-list').toggleClass('is-hidden');
    },

    _shareToSocial: function(e) {
      e && e.preventDefault();
      var width  = 575,
          height = 400,
          left   = ($(window).width()  - width)  / 2,
          top    = ($(window).height() - height) / 2,
          url    = $(e.currentTarget).attr('href'),
          opts   = 'status=1' +
                   ',width='  + width  +
                   ',height=' + height +
                   ',top='    + top    +
                   ',left='   + left;

      window.open(url, 'Share this map view', opts);
    },

  });

  return CountryShowView;

});
