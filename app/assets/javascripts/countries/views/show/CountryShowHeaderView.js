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

      sql = "SELECT m.the_geom FROM ne_50m_admin_0_countries m WHERE m.adm0_a3 = '" + iso + "'&format=topojson";

      d3.json('https://wri-01.cartodb.com/api/v2/sql?q=' + sql, _.bind(function(error, topology) {
        this.helper.draw(topology, 0, 'figure-' + iso.toLowerCase(), { alerts: true });
      }, this ));
    }

  });

  return CountryShowHeaderView;

});
