/**
 *
 *
 *
 */
define(['abstract/layer/ImageMaptypeLayerClass'], function(
  ImageMaptypeLayerClass
) {
  'use strict';

  var UptakeTotal2038Layer = ImageMaptypeLayerClass.extend({
    options: {
      urlTemplate:
        'https://api.resourcewatch.org/v1/layer/d342d3a6-b483-42a2-ad67-1961473cd8f9/tile/gee/{z}/{x}/{y}'
    }
  });

  return UptakeTotal2038Layer;
});
