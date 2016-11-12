define([
  'backbone',
  'd3',
  'jquery',
  'text!countries/templates/report/country-geo.handlebars'
], function(Backbone, d3, $, tpl) {
  'use strict';

  var CountryReportView = Backbone.View.extend({

    template: Handlebars.compile(tpl),

    defaults: {
      query: '?q=SELECT climate_iso AS iso, ST_AsGeoJSON (ST_Simplify(ST_RemoveRepeatedPoints(the_geom, 0.00005), 0.01)) AS the_geom FROM gadm27_adm0 WHERE climate_iso IS NOT NULL AND climate_iso =',
      iso: ''
    },

    initialize: function(settings) {
      this.defaults = _.extend({}, this.defaults, settings);
      this.iso = this.defaults.iso;

      this.init();
    },

    init: function() {
      this._getData()
        .then(function(data){
          this.geoJSON = JSON.parse(data.rows[0].the_geom);
          this.render();
        }.bind(this))
    },

    _getData: function() {
      return $.getJSON(window.gfw.config.CDB_API_HOST + this.defaults.query + '\'' +this.iso + '\'');
    },

    render: function() {
      this.$el.html(this.template({}));
      // this._renderGeo();
    },

    _renderGeo: function() {
      var data = this.geoJSON;
      var size = {
        width: this.el.clientWidth,
        height: 160
      }

      var el = this.el.querySelector('#country-geo');
      var path = d3.geo.path();
      var svg = d3.select(el).append("svg").attr(size);
      svg.selectAll("path")
        .data(data)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("fill", '#999');
    }
  });

  return CountryReportView;

});
