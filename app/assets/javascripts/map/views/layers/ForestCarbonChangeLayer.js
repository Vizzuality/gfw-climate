/**
 *  May 2017
 *  Slug for these data will be forest_carbon_change
 *
 * @return ImageMaptypeLayerClass class
 */
define(['abstract/layer/ImageMaptypeLayerClass'], function(
  ImageMaptypeLayerClass
) {
  'use strict';

  var CarbonChangeLayer = ImageMaptypeLayerClass.extend({
    options: {
      urlTemplate:
        'https://storage.googleapis.com/gfw-climate-tiles/emissions-disturbance-model-alt/{z}/{x}/{y}.png'
    }
  });

  return CarbonChangeLayer;
});
