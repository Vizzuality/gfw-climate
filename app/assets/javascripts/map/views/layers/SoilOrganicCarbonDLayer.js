/**
 * hsdw
 *
 * @return ProtectedAreasCDBLayer class (extends CartoDBLayerClass)
 */
define(['abstract/layer/ImageMaptypeLayerClass'], function(
  ImageMaptypeLayerClass
) {
  'use strict';
  var FEATURE_CARBON_UPDATE =
    window.gfw.config.FEATURE_CARBON_UPDATE === 'true';

  var SoilOrganicCarbonDLayer = ImageMaptypeLayerClass.extend({
    options: {
      urlTemplate: FEATURE_CARBON_UPDATE
        ? 'https://storage.googleapis.com/gfw-climate-tiles/soil%20organic%20carbon/{z}/{x}/{y}.png'
        : 'https://s3.amazonaws.com/wri-tiles/hwsd{/z}{/x}{/y}.png'
    }
  });

  return SoilOrganicCarbonDLayer;
});
