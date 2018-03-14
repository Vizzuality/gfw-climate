/**
 * The Image map layer module.
 *
 * @return WMSLayer class (extends Class).
 */
define(['underscore', 'uri', 'abstract/layer/OverlayLayerClass'], function(
  _,
  UriTemplate,
  OverlayLayerClass
) {
  'use strict';

  function bound(value, opt_min, opt_max) {
    if (opt_min != null) value = Math.max(value, opt_min);
    if (opt_max != null) value = Math.min(value, opt_max);
    return value;
  }

  function degreesToRadians(deg) {
    return deg * (Math.PI / 180);
  }

  function radiansToDegrees(rad) {
    return rad / (Math.PI / 180);
  }

  function MercatorProjection() {
    var MERCATOR_RANGE = 256;
    this.pixelOrigin_ = new google.maps.Point(
      MERCATOR_RANGE / 2,
      MERCATOR_RANGE / 2
    );
    this.pixelsPerLonDegree_ = MERCATOR_RANGE / 360;
    this.pixelsPerLonRadian_ = MERCATOR_RANGE / (2 * Math.PI);
  }

  MercatorProjection.prototype.fromLatLngToPoint = function(latLng, opt_point) {
    var me = this;

    var point = opt_point || new google.maps.Point(0, 0);

    var origin = me.pixelOrigin_;
    point.x = origin.x + latLng.lng() * me.pixelsPerLonDegree_;
    // NOTE(appleton): Truncating to 0.9999 effectively limits latitude to
    // 89.189.  This is about a third of a tile past the edge of the world tile.
    var siny = bound(Math.sin(degreesToRadians(latLng.lat())), -0.9999, 0.9999);
    point.y =
      origin.y +
      0.5 * Math.log((1 + siny) / (1 - siny)) * -me.pixelsPerLonRadian_;
    return point;
  };

  MercatorProjection.prototype.fromDivPixelToLatLng = function(pixel, zoom) {
    var me = this;

    var origin = me.pixelOrigin_;
    var scale = Math.pow(2, zoom);
    var lng = (pixel.x / scale - origin.x) / me.pixelsPerLonDegree_;
    var latRadians = (pixel.y / scale - origin.y) / -me.pixelsPerLonRadian_;
    var lat = radiansToDegrees(
      2 * Math.atan(Math.exp(latRadians)) - Math.PI / 2
    );
    return new google.maps.LatLng(lat, lng);
  };

  MercatorProjection.prototype.fromDivPixelToSphericalMercator = function(
    pixel,
    zoom
  ) {
    var me = this;
    var coord = me.fromDivPixelToLatLng(pixel, zoom);

    var r = 6378137.0;
    var x = r * degreesToRadians(coord.lng());
    var latRad = degreesToRadians(coord.lat());
    var y = r / 2 * Math.log((1 + Math.sin(latRad)) / (1 - Math.sin(latRad)));

    return new google.maps.Point(x, y);
  };

  var WMSLayerClass = OverlayLayerClass.extend({
    init: function(layer, options, map) {
      this.url = this.options.url;
      this.tiles = layer.tileurl;
      this._super(layer, options, map);
      this._setImageMapType(layer);
    },

    _getLayer: function() {
      var deferred = new $.Deferred();
      deferred.resolve(this._imageMaptype);
      return deferred.promise();
    },

    _setImageMapType: function(layer) {
      this._imageMaptype = new google.maps.ImageMapType({
        getTileUrl: _.bind(this._getTileUrl, this),
        tileSize: this.tileSize,
        name: this.name,
        url: this.tiles
      });
    },

    _getTileUrl: function(coord, zoom) {
      var lULP = new google.maps.Point(coord.x * 256, (coord.y + 1) * 256);
      var lLRP = new google.maps.Point((coord.x + 1) * 256, coord.y * 256);
      var projectionMap = new MercatorProjection();

      var lULg = projectionMap.fromDivPixelToSphericalMercator(lULP, zoom);
      var lLRg = projectionMap.fromDivPixelToSphericalMercator(lLRP, zoom);

      var lUL_Latitude = lULg.y;
      var lUL_Longitude = lULg.x;
      var lLR_Latitude = lLRg.y;
      var lLR_Longitude = lLRg.x;
      //GJ: there is a bug when crossing the -180 longitude border (tile does not render) - this check seems to fix it
      if (lLR_Longitude < lUL_Longitude) {
        lLR_Longitude = Math.abs(lLR_Longitude);
      }
      var url = this.url;
      url +=
        '&BBOX=' +
        lUL_Longitude +
        ',' +
        lUL_Latitude +
        ',' +
        lLR_Longitude +
        ',' +
        lLR_Latitude; // set bounding box
      return url;
    }
  });
  return WMSLayerClass;
});
