define(
  [
    'backbone',
    'jquery',
    'countries/presenters/show/CountryHeaderPresenter',
    'helpers/CountryHelper',
    'text!countries/templates/country-stats.handlebars'
  ],
  function(Backbone, $, CountryHeaderPresenter, CountryHelper, statsTpl) {
    'use strict';
    var CountryShowHeaderView = Backbone.View.extend({
      el: '#headerCountry',

      templateStats: Handlebars.compile(statsTpl),

      initialize: function() {
        this.presenter = new CountryHeaderPresenter(this);
        this.$statsContainer = this.$('#headerCountryStats');
      },

      start: function() {
        this._drawCountry();
      },

      drawStats: function(stats) {
        if (stats) {
          this.$el.addClass('-has-stats');
          this.$statsContainer.html(this.templateStats(stats));
        }
      },

      _drawCountry: function() {
        var iso = this.presenter.status.get('iso'), sql;

        if (!iso) {
          return;
        }

        if ($('#figure-' + iso.toLowerCase()[0])) {
          $('#figure-' + iso.toLowerCase()).html('');
        }

        sql = [
          'SELECT ST_GeomFromText(topojson) AS the_geom',
          'FROM gadm28_countries',
          "WHERE UPPER(iso) = UPPER('" + iso + "')",
          '&format=topojson'
        ].join(' ');

        $.getJSON(gfw.config.CDB_API_HOST + '?q=' + sql)
          .then(function(topology) {
            var el = '#figure-' + iso.toLowerCase();
            CountryHelper.draw(topology, el, { alerts: true });
          }.bind(this));
      }
    });

    return CountryShowHeaderView;
  }
);
