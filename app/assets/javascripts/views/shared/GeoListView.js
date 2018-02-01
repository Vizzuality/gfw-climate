define(
  [
    'backbone',
    'handlebars',
    'underscore',
    'helpers/CountryHelper',
    'text!templates/shared/geo-list.handlebars'
  ],
  function(Backbone, Handlebars, _, CountryHelper, tpl) {
    'use strict';
    var GeoListView = Backbone.View.extend({
      events: {
        'keyup #searchCountry': 'searchCountries',
        'focus #searchCountry': 'scrollTo'
      },

      defaults: {
        placeholder: 'Type country name'
      },

      template: Handlebars.compile(tpl),

      initialize: function(settings) {
        this.params = _.extend({}, this.defaults, settings);
        this.params.id = this.el.id;
        this.render(this.params);
        this.renderGeo(this.params.data);
        this.cache();
      },

      cache: function() {
        this.$searchBox = $('#searchCountry');
        this.$countries = $('.country');
      },

      render: function(data) {
        this.$el.html(this.template(data));
        return this;
      },

      renderGeo: function(data) {
        if (data && data.length) {
          for (var i = 0, dLength = data.length; i < dLength; i++) {
            if (data[i].topojson) {
              var el = '#' + this.el.id + '-' + data[i].iso + '-geometry';
              CountryHelper.draw(data[i].topojson, el, {
                width: 150,
                height: 150
              });
            }
          }
        }
      },

      scrollTo: function() {
        $('html,body').animate({
          scrollTop: this.$searchBox.offset().top - 20
        });
      },

      searchCountries: function(e) {
        // TODO: move this to the presenter
        var searchText = this.$searchBox.val();
        var val = $.trim(searchText)
          .replace(/ +/g, ' ')
          .toLowerCase();
        var count = [];

        this.$countries
          .show()
          .filter(function() {
            var text = $(this)
              .find('.country-name')
              .text()
              .replace(/\s+/g, ' ')
              .toLowerCase();
            text.indexOf(val) !== -1 ? count.push($(this)) : null;
            return !~text.indexOf(val);
          })
          .hide();

        count.length === 1
          ? this.$searchBox.addClass('is-active')
          : this.$searchBox.removeClass('is-active');

        if (e) {
          if (e.keyCode === 13 && count.length === 1) {
            var href = $(count[0])
              .find('.country-href')
              .attr('href');
            window.location = href;
          }
        }
      }
    });
    return GeoListView;
  }
);
