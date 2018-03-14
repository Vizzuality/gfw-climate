/**
 * The Forma Coverage layer module for use on canvas.
 *
 * @return FormaCoverLayer class (extends CanvasLayerClass)
 */
define(['abstract/layer/CartoDBLayerClass'], function(CartoDBLayerClass) {
  'use strict';

  var ProdesCoverLayer = CartoDBLayerClass.extend({
    options: {
      sql:
        "SELECT *, '{tableName}' AS layer, '{tableName}' AS name FROM {tableName}"
    }
  });

  return ProdesCoverLayer;
});
