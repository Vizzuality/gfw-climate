/**
 * The cartodb layer module.
 *
 * @return LandRightsLayer class (extends CartoDBLayerClass)
 */
define(
  [
    'abstract/layer/CartoDBLayerClass',
    'text!map/cartocss/PeatLandsDrainage.cartocss'
  ],
  function(CartoDBLayerClass, PeatLandsDrainageCartoCSS) {
    'use strict';

    var PeatLandsDrainageLayer = CartoDBLayerClass.extend({
      options: {
        sql:
          "SELECT the_geom_webmercator, cartodb_id, '{tableName}' AS tablename, '{tableName}' AS layer, country, area_ha, emisc02ha, spec_simp type_text, {analysis} AS analysis FROM {tableName}",
        infowindow: true,
        interactivity:
          'cartodb_id, tablename, layer, country, area_ha, emisc02ha, type_text, analysis',
        analysis: false,
        cartocss: PeatLandsDrainageCartoCSS
      }
    });

    return PeatLandsDrainageLayer;
  }
);
