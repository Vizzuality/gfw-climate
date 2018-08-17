/**
 *
 *
 *
 */
define(['abstract/layer/ImageMaptypeLayerClass'], function(
    ImageMaptypeLayerClass
  ) {
    'use strict';

    var UptakeTotal2028Layer = ImageMaptypeLayerClass.extend({
      options: {
        urlTemplate:
          'https://api.resourcewatch.org/v1/layer/63dadfc5-b2bb-412c-96eb-67fe98d92dd5/tile/gee/{z}/{x}/{y}'
      }
    });

    return UptakeTotal2028Layer;
  });
