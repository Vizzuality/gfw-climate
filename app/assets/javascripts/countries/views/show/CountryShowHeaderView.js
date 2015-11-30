define([
  'backbone',
  'd3',
  'countries/presenters/show/CountryHeaderPresenter',
  'helpers/CountryHelper'
], function(Backbone, d3, CountryHeaderPresenter, CountryHelper) {

  'use strict';

  var CountryShowHeaderView = Backbone.View.extend({

    el: '#headerCountry',

    initialize: function() {
      this.presenter = new CountryHeaderPresenter(this);
      this.helper = CountryHelper;
    },

    start: function() {
      this._drawCountry();
    },

    _drawCountry: function() {
      var iso = this.presenter.status.get('iso'),
       sql;

      if (!iso) { return;}

      if($('#figure-' + iso.toLowerCase()[0])) {
        $('#figure-' + iso.toLowerCase()).html('');
      }

      sql = ['SELECT ST_Simplify(ST_RemoveRepeatedPoints(the_geom, 0.00005), 0.01) AS the_geom',
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
