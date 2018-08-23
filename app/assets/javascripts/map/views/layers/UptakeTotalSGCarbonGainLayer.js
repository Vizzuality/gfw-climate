/**
 *
 *
 *
 * @return ProtectedAreasCDBLayer class (extends CartoDBLayerClass)
 */
define(['abstract/layer/ImageMaptypeLayerClass'], function(
  ImageMaptypeLayerClass
) {
  'use strict';

  var UptakeTotalSGCarbonGainLayer = ImageMaptypeLayerClass.extend({
    options: {
      urlTemplate:
        'https://api.resourcewatch.org/v1/layer/c9e48a9f-2dca-4233-9400-0b5e4e07674f/tile/gee/{z}/{x}/{y}'
    }
  });

  return UptakeTotalSGCarbonGainLayer;
});
