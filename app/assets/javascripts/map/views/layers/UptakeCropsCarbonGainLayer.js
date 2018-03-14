/**
 * The ProtectedAreasCDB layer module.
 *
 * @return ProtectedAreasCDBLayer class (extends CartoDBLayerClass)
 */
define(
  [
    'abstract/layer/CartoDBLayerClass',
    'text!map/cartocss/uptake_pastures.cartocss'
  ],
  function(CartoDBLayerClass, uptake_pastures_coverCartoCSS) {
    'use strict';

    var UptakeCropsCarbonGainLayer = CartoDBLayerClass.extend({
      options: {
        sql:
          "SELECT *, '{tableName}' as tablename, '{tableName}' as layer FROM {tableName}",
        cartocss: uptake_pastures_coverCartoCSS,
        infowindow: false,
        analysis: false,
        interactivity: '',
        raster: true,
        raster_band: 1
      }
    });

    return UptakeCropsCarbonGainLayer;
  }
);
