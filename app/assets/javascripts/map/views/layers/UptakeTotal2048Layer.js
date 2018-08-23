/**
 *
 *
 *
 */
define(['abstract/layer/ImageMaptypeLayerClass'], function(
  ImageMaptypeLayerClass
) {
  'use strict';

  var UptakeTotal2048Layer = ImageMaptypeLayerClass.extend({
    options: {
      urlTemplate:
        'https://api.resourcewatch.org/v1/layer/fffa76d3-5008-48b7-afeb-2c7054548f2e/tile/gee/{z}/{x}/{y}'
    }
  });

  return UptakeTotal2048Layer;
});
