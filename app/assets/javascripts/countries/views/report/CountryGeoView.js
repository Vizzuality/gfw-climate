define(
  [
    'handlebars',
    'backbone',
    'underscore',
    'helpers/CountryHelper',
    'helpers/NumbersHelper',
    'text!countries/templates/report/country-geo.handlebars'
  ],
  function(Handlebars, Backbone, _, CountryHelper, NumbersHelper, tpl) {
    'use strict';

    var CountryGeoView = Backbone.View.extend({
      template: Handlebars.compile(tpl),

      defaults: {
        query: '?q=SELECT iso, topojson FROM gadm28_countries WHERE iso =',
        iso: '',
        topojson: null
      },

      initialize: function(settings) {
        this.settings = _.extend({}, this.defaults, settings);
        this.iso = this.settings.iso;
        this.country = this.settings.country;
        this.ha = this.settings.ha;
        this.topoJSON = this.settings.topojson;

        this.init();
      },

      init: function() {
        if (this.topoJSON) {
          this.render();
        } else {
          this._getData().then(
            function(data) {
              var topojson = null;
              if (data.rows.length > 0) {
                topojson = JSON.parse(data.rows[0].topojson);
              }
              this.topoJSON = topojson;
              this.render();
            }.bind(this)
          );
        }
      },

      _getData: function() {
        return $.getJSON(
          window.gfw.config.CDB_API_HOST +
            this.settings.query +
            "'" +
            this.iso +
            "'"
        );
      },

      render: function() {
        var km2 = NumbersHelper.addNumberDecimals(Math.round(this.ha / 100));
        var ha = NumbersHelper.addNumberDecimals(Math.round(this.ha));

        this.$el.html(
          this.template({
            country: this.country,
            km2: km2,
            ha: ha
          })
        );
        this._renderGeo();
      },

      _renderGeo: function() {
        CountryHelper.draw(this.topoJSON, '#country-geo', {
          alerts: true,
          width: 170,
          height: 170
        });
      }
    });

    return CountryGeoView;
  }
);
