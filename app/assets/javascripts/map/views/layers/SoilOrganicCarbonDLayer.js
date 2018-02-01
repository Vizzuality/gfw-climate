/**
 * hsdw
 *
 * @return ProtectedAreasCDBLayer class (extends CartoDBLayerClass)
 */
define(['abstract/layer/ImageMaptypeLayerClass'], function(
  ImageMaptypeLayerClass
) {
  'use strict';

  var SoilOrganicCarbonDLayer = ImageMaptypeLayerClass.extend({
    options: {
      urlTemplate:
        'https://storage.googleapis.com/gfw-climate-tiles/soil%20organic%20carbon/{z}/{x}/{y}.png'
    }
  });

  return SoilOrganicCarbonDLayer;
});
