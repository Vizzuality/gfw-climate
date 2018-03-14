/**
 * The WoodFiberPlantations layer module.
 *
 * @return WoodFiberPlantationsLayer class (extends CartoDBLayerClass)
 */
define(['abstract/layer/CartoDBLayerClass'], function(CartoDBLayerClass) {
  'use strict';

  var WoodFiberPlantationsLayer = CartoDBLayerClass.extend({
    options: {
      sql:
        "SELECT 'fiber' as tablename, cartodb_id, the_geom_webmercator,name, type,group_comp as company, area_ha, '{tableName}' AS layer, {analysis} AS analysis FROM {tableName}",
      infowindow: true,
      interactivity:
        'cartodb_id, tablename,name, type, company, area_ha, analysis',
      analysis: true
    }
  });

  return WoodFiberPlantationsLayer;
});
