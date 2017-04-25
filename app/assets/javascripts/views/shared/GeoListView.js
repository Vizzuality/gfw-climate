define(
  [
    'backbone',
    'handlebars',
    'helpers/CountryHelper',
    'text!templates/shared/geo-list.handlebars'
  ],
  function(Backbone, Handlebars, CountryHelper, tpl) {
    'use strict';
    var GeoListView = Backbone.View.extend({
      template: Handlebars.compile(tpl),

      initialize: function(settings) {
        this.params = _.extend({}, this.defaults, settings);
        this.render(this.params);
        this.renderGeo(this.params.data);
      },

      render: function(data) {
        this.$el.html(this.template(data));
      },

      renderGeo: function(data) {
        if (data && data.length) {
          for (var i = 0, dLength = data.length; i < dLength; i++) {
            if (data[i].topojson) {
              var el = '#' + data[i].iso + '-geometry';
              CountryHelper.draw(data[i].topojson, el, {
                width: 150,
                height: 150
              });
            }
          }
        }
      }
    });
    return GeoListView;
  }
);
