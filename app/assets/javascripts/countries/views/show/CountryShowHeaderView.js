define([
  'backbone',
  'd3',
  'countries/presenters/show/CountryHeaderPresenter',
  'helpers/CountryHelper',
  'text!countries/templates/country-stats.handlebars'
], function(Backbone, d3, CountryHeaderPresenter, CountryHelper, statsTpl) {

  'use strict';

  var CountryShowHeaderView = Backbone.View.extend({

    el: '#headerCountry',

    templateStats: Handlebars.compile(statsTpl),

    initialize: function() {
      this.presenter = new CountryHeaderPresenter(this);
      this.helper = CountryHelper;
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
      var iso = this.presenter.status.get('iso'),
       sql;

      if (!iso) { return;}

      if($('#figure-' + iso.toLowerCase()[0])) {
        $('#figure-' + iso.toLowerCase()).html('');
      }

      sql = ['SELECT ST_GeomFromText(topojson) AS the_geom',
             'FROM gadm27_adm0',
             "WHERE UPPER(climate_iso) = UPPER('" + iso + "')",
             '&format=topojson'].join(' ');

      d3.json('https://wri-01.cartodb.com/api/v2/sql?q=' + sql, _.bind(function(error, topology) {
        this.helper.draw(topology, 0, 'figure-' + iso.toLowerCase(), { alerts: true });
      }, this ));
    }

  });

  return CountryShowHeaderView;

});
