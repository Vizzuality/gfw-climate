/**
 * GeoJSON Styling
 * Applies styles for different types
 * of geojson.
 */
define([
  'underscore',
  'handlebars',
], function(_, Handlebars) {

  'use strict';

  var GeoStylingView = Backbone.View.extend({

    defaults: {
      styles: {
        tropics: {
          strokeWeight: 0,
          fillOpacity: 0.3,
          fillColor: '#000',
          strokeColor: "#000",
          strokeOpacity: 0
        },
        analysis: {
          strokeWeight: 2,
          fillOpacity: 0,
          strokeColor: '#5B80A0',
          strokeOpacity: 1,
          icon: {
            url: '/assets/icons/marker_exclamation.png',
            size: [36, 36],
            offset: [0, 0],
            anchor: [18, 18]
          }
        },
        country: {
          strokeWeight: 2,
          fillOpacity: 0,
          fillColor: '#FFF',
          strokeColor: '#5B80A0',
          strokeOpacity: 1,
          icon: {
            url: '/assets/icons/marker_exclamation.png',
            size: [36, 36],
            offset: [0, 0],
            anchor: [18, 18]
          }
        }
      }
    },

    initialize: function(params) {
      this.options = _.extend({}, this.defaults, params || {});
      this.styles = this.options.styles;
      this.map = this.options.map;
    },

    setStyles: function() {
      this.map.data.setStyle(_.bind(function(feature){
        for (var current in this.styles) {
          var style = this.styles[current];

          if (style && feature.getProperty('polyType') === current) {
            if (style.icon) {
              style.icon = this._getIcon(style.icon);
            }
            return style;
          }
        }
      }, this ));
    },

    getStyles: function(type) {
      var style = this.styles[type];

      if (style.icon) {
        style.icon = this._getIcon(style.icon);
      }

      return style;
    },

    _getIcon: function(params) {
      var icon;
      var iconData = params;

      if (iconData.size && iconData.offset) {
        icon = new google.maps.MarkerImage(
          iconData.url,
          new google.maps.Size(iconData.size[0], iconData.size[1]), // Size
          new google.maps.Point(iconData.offset[0], iconData.offset[1]), // Offset
          new google.maps.Point(iconData.anchor[0], iconData.anchor[1]) // Anchor
        );
      }
      return icon;
    }

  });
  return GeoStylingView;

});
