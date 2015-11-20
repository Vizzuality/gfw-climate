
/**
 * hsdw
 *
 * @return ProtectedAreasCDBLayer class (extends CartoDBLayerClass)
 */
define([
  'abstract/layer/CartoDBLayerClass',
  'text!map/cartocss/hwsd.cartocss'
], function(CartoDBLayerClass,hwsdCartoCSS) {

  'use strict';

  var SoilOrganicCarbonDLayer = CartoDBLayerClass.extend({

    options: {
      sql: 'SELECT *, \'{tableName}\' as tablename, \'{tableName}\' as layer FROM {tableName}',
      cartocss: hwsdCartoCSS,
      infowindow: false,
      analysis: false,
      interactivity:'',
      raster: true,
      raster_band: 1
    },
  
  });

  return SoilOrganicCarbonDLayer;

});