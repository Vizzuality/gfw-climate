/**
 * The Mining layer module.
 *
 * @return MiningLayer class (extends CartoDBLayerClass)
 */
define(
  [
    'abstract/layer/CartoDBLayerClass',
    'text!map/cartocss/mangrove_biomass.cartocss'
  ],
  function(CartoDBLayerClass, mangrove_biomassCartocss) {
    'use strict';

    var MangroveBiomassLayer = CartoDBLayerClass.extend({
      options: {
        sql:
          "SELECT '{tableName}' as tablename, cartodb_id, the_geom_webmercator, round(bm_t_ha) AS bm_t_ha, '{tableName}' AS layer, {analysis} AS analysis FROM {tableName}",
        infowindow: true,
        interactivity: 'cartodb_id, tablename, bm_t_ha, analysis',
        analysis: false,
        cartocss: mangrove_biomassCartocss
      }
    });

    return MangroveBiomassLayer;
  }
);
