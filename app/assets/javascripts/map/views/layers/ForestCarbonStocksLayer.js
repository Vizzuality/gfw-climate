/**
 *  May 2017
 *  Slug for these data will be forest_carbon_stocks
 *
 * @return ImageMaptypeLayerClass class
 */
define(['abstract/layer/ImageMaptypeLayerClass'], function(
  ImageMaptypeLayerClass
) {
  'use strict';

  var CarbonStockLayer = ImageMaptypeLayerClass.extend({
    options: {
      urlTemplate:
        'https://storage.googleapis.com/gfw-climate-tiles/emissions-disturbance-model-dark/{z}/{x}/{y}.png'
    }
  });

  return CarbonStockLayer;
});
