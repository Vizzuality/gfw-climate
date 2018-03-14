/**
 * The LandRights layer module.
 * options: {
      sql: 'SELECT the_geom_webmercator, cartodb_id, \'{tableName}\' AS tablename, \'{tableName}\' AS layer, name, legal_term as national_legal_term, reco as legal_recognition, status_dat as date_create, {analysis} AS analysis FROM {tableName}',
      infowindow: true,
      interactivity: 'cartodb_id, tablename, name, layer, national_legal_term, legal_recognition, date_create, analysis',
      analysis: true,
      raster:true,
      band:1
    }
 * @return LandRightsLayer class (extends CartoDBLayerClass)
 */
define(['abstract/layer/ImageLayerClass'], function(ImageLayerClass) {
  'use strict';

  var GtmForestDensityLayer = ImageLayerClass.extend({
    options: {
      urlTemplate:
        'https://s3.amazonaws.com/wri-tiles/GTM/guatemaladensity{/z}{/x}{/y}.png',
      dataMaxZoom: 15
    }
  });

  return GtmForestDensityLayer;
});
