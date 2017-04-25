/**
 * The Feed view.
 */
define([
  'jquery',
  'backbone',
  'underscore',
  'amplify',
  'd3',
  'mps',
  'services/CountryService',
  'views/shared/GeoListView'
], function($, Backbone, _,amplify, d3, mps, CountryService, GeoListView) {

  'use strict';

  var CountryListView = Backbone.View.extend({

    el: '#countryListView',

    events : {
      'keyup #searchCountry' : '_searchCountries',
      'focus #searchCountry' : 'scrollTo'
    },

    initialize: function() {
      if (!this.$el.length) {
        return
      }

      this.$searchBox = $('#searchCountry');
      this._getCountries();
      this._drawCountries();
      this._searchCountries();
    },

    _getCountries : function(){
      this.$countries = $('.country');
      this.countries_list = _.map($('.country-name'),function(el){
        return $(el).text();
      });
    },

    _searchCountries : function(e){
      // TODO: FIX THIS WITH THE NEW SERVICE!
      var searchText = this.$searchBox.val(),
          val = $.trim(searchText).replace(/ +/g, ' ').toLowerCase(),
          count = [];

      this.$countries.show().filter(function() {
          var text = $(this).find('.country-name').text().replace(/\s+/g, ' ').toLowerCase();
          (text.indexOf(val) != -1) ? count.push($(this)) : null;
          return !~text.indexOf(val);
      }).hide();

      (count.length == 1) ? this.$searchBox.addClass('is-active') : this.$searchBox.removeClass('is-active');

      if (e) {
        if (e.keyCode == 13 && count.length == 1) {
          var href = $(count[0]).find('.country-href').attr('href');
          window.location = href;
        }
      }
    },


    scrollTo: function(){
      $('html,body').animate({ scrollTop : this.$searchBox.offset().top - 20 });
    },


    _drawCountries: function() {
      var that = this;
      CountryService.getCountries({ geo: true })
        .then(function(countryData) {
           this.countryList = new GeoListView({
              el: '.countries_list_index',
              data: countryData
            });
        }.bind(this));
    }
  });

  return CountryListView;

});
