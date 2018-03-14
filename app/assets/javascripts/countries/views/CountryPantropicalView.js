define(
  [
    'backbone',
    'd3',
    'chosen',
    'countries/views/pantropical/PantropicalTotalEmissionsView',
    'countries/views/pantropical/vis',
    'views/ShareView'
  ],
  function(
    Backbone,
    d3,
    chosen,
    PantropicalTotalEmissionsView,
    vis,
    ShareView
  ) {
    'use strict';

    var CountryShowView = Backbone.View.extend({
      el: '.pantropical-vis',

      events: {
        'click #view_selection .btn': 'switch_view',
        'input #year-picker': '_change_year',
        'click .minusy': '_change_year',
        'change #year-drop-left': '_set_year',
        'change #year-drop-right': '_set_year',
        'click .btn-submit': '_submityears',
        'click .play': '_play',
        'click .pause': '_pause',
        'change #pantropical-search': '_search_country',
        'click #pantropical-search-delete': '_search_country',
        'click #pantropical-share': '_open_share'
      },

      initialize: function() {
        //I can't find who is giving display:block to country tab...
        var currentTab = location.search.split('tab=')[1];
        $('#vis')
          .find('.country')
          .hide();

        this._cacheVars();
        this._setRankingAverage();
        this._setAutocomplete();

        if (!!currentTab) {
          window.setTimeout(function() {
            $('#' + currentTab).trigger('click');
          }, 50);
        }
      },

      _setRankingAverage: function() {
        $('#year-drop-right').val('2013');
      },

      _cacheVars: function() {
        this.$years = $('#year-picker');
        this.$yearsPickerLabel = $('#year-picker-label');
        this.$play_pause = $('#play-pause');
        this.$playBtn = this.$play_pause.find('.play');
        this.$pauseBtn = this.$play_pause.find('.pause');
        this.$progressbar = $('.progress-year');
        this.progression = 0;
        this.ticks = ~~this.$years.attr('max') - ~~this.$years.attr('min');
        this.$search = $('#pantropical-search');
        this.$deleteSelection = $('#pantropical-search-delete');
      },

      switch_view: function(e) {
        $('#vis')
          .find('.vis-tab')
          .hide();
        $('#view_selection')
          .find('.btn')
          .removeClass('active');
        $(e.target).addClass('active');
        $('#vis')
          .find('.' + $(e.target).attr('id'))
          .show();

        var viewId = $(e.target).attr('id');
        ga('send', 'event', 'pantropical', 'Choose visualisation', viewId);
        // This should be removed as long as we have a router
        this._updateUrl(viewId);
        toggle_view(viewId);

        if (viewId === 'change') {
          $('#vis').addClass(viewId);
          this._renderChangeComponents();
        }
        return false;
      },

      _updateUrl: function(viewId) {
        history.pushState(
          '',
          document.title,
          window.location.origin + window.location.pathname + '?tab=' + viewId
        );
      },

      _getUrlParams: function() {
        var regex = /[?&]([^=#]+)=([^&#]*)/g,
          params = {},
          match;
        while ((match = regex.exec(location.href))) {
          params[match[1]] = match[2];
        }
        return params;
      },

      _submityears: function() {
        toggle_view('country', this.year);
      },

      _set_year: function(e) {
        var element = e.target;
        var element2;
        if (element.id == 'year-drop-left') {
          element2 = document.getElementById('year-drop-right');
          this.year_left = parseInt(
            element.options[element.selectedIndex].value
          );
          this.year_right = parseInt(
            element2.options[element2.selectedIndex].value
          );
          this._hideYears(element.id);
          ga('send', 'event', 'pantropical', 'Start Year', this.year_left);
        } else if (element.id == 'year-drop-right') {
          element2 = document.getElementById('year-drop-left');
          this.year_right = parseInt(
            element.options[element.selectedIndex].value
          );
          this.year_left = parseInt(
            element2.options[element2.selectedIndex].value
          );
          this._hideYears(element.id);
          ga('send', 'event', 'pantropical', 'Start Year', this.year_right);
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

        if (elementID == 'year-drop-left') {
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
          });
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
          });
        }
      },

      _change_year: function(e, year_moved) {
        var year = e ? e.currentTarget.value : year_moved;
        ga('send', 'event', 'pantropical', 'Change Timeline', year);

        this.$yearsPickerLabel.val(year);
        this._setLabelPosition(year);

        toggle_view('change', year, true);
      },

      _setLabelPosition: function(year) {
        var width = this.$years.width();
        var newPlace;

        // Figure out placement percentage between left and right of input
        var newPoint =
          (year - this.$years.attr('min')) /
          (this.$years.attr('max') - this.$years.attr('min'));

        if (newPoint < 0) {
          newPlace = 0;
        } else if (newPoint > 1) {
          newPlace = width;
        } else {
          newPlace = width * newPoint;
        }

        this.$yearsPickerLabel.css({ left: newPlace });
      },

      _renderChangeComponents: function() {
        if (!this.totalEmissionsChart) {
          this.totalEmissionsChart = new PantropicalTotalEmissionsView();
        }
      },
      _setAutocomplete: function() {
        this.$search.chosen({
          width: '100%'
        });
        d3.csv(
          '/pantropicalTESTING_isos.csv',
          _.bind(function(data) {
            this.$search.html('<option value="">Select country</option>');
            var options = _.compact(
              _.map(_.sortBy(data, 'Country'), function(d) {
                if (parseFloat(d.Average).toFixed(3) > 0.003) {
                  return (
                    '<option value="' +
                    d.FIPS_CNTRY +
                    '">' +
                    d.Country +
                    '</option>'
                  );
                }
                return null;
              })
            );
            this.$search.append(options.join('')).trigger('chosen:updated');
          }, this)
        );
      },

      _search_country: function(e) {
        d3.selection.prototype.moveToFront = function() {
          return this.each(function() {
            this.parentNode.appendChild(this);
          });
        };
        var iso = $(e.currentTarget).val();
        this.$deleteSelection.toggleClass('is-active', !!iso);
        if (!!iso) {
          _.each($('#svg_vis').find('.bubble'), function(b) {
            if (iso === $(b).data('iso')) {
              $(b).attr('opacity', '1');
              d3.select(b).moveToFront();
            } else {
              $(b).attr('opacity', '0.25');
            }
          });
        } else {
          this.$search.val('').trigger('chosen:updated');
          _.each($('#svg_vis').find('.bubble'), function(b) {
            $(b).attr('opacity', '1');
          });
        }
      },

      _open_share: function(event) {
        var shareView = new ShareView().share(event);
        $('body').append(shareView.el);
      },

      // PLAYER FUNCTIONS
      _player: function() {
        if (this.$play_pause.hasClass('is-playing')) {
          window.setTimeout(
            function() {
              this.progression += 100 / this.ticks;

              var year;

              if (
                ~~this.$yearsPickerLabel.val() + 1 >
                this.$years.attr('max')
              ) {
                year = this.$years.attr('min');
                this.progression = 0;
              } else {
                year = ~~this.$yearsPickerLabel.val() + 1;
              }

              if (year <= this.$years.attr('max')) {
                this._change_year(null, year); // update label
                this.$years.val(year); // update range position
                this.$progressbar.css({
                  left: this.progression + '%'
                });
                this._player(); // paint next year
              }

              if (year == this.$years.attr('max')) {
                this.$play_pause.removeClass('is-playing');

                this.$playBtn.removeClass('is-hidden');
                this.$pauseBtn.addClass('is-hidden');
              }
            }.bind(this),
            750
          );
        }
      },

      _play: function() {
        ga('send', 'event', 'pantropical', 'Change Timeline', 'play');
        this.$play_pause.addClass('is-playing');
        this.$play_pause.removeClass('stop');

        this.$playBtn.addClass('is-hidden');
        this.$pauseBtn.removeClass('is-hidden');

        this._player();
      },

      _pause: function() {
        ga('send', 'event', 'pantropical', 'Change Timeline', 'pause');
        if (this.$play_pause.hasClass('stop')) {
          this._play();
        } else {
          this.$playBtn.removeClass('is-hidden');
          this.$pauseBtn.addClass('is-hidden');

          this.$play_pause.removeClass('is-playing');
          this.$play_pause.addClass('stop');

          this._player();
        }
      }
    });

    return CountryShowView;
  }
);
