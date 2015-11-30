
/**
 * hsdw
 *
 * @return ProtectedAreasCDBLayer class (extends CartoDBLayerClass)
 */
define([
  'abstract/layer/ImageMaptypeLayerClass',
], function(ImageMaptypeLayerClass) {

  'use strict';

  var SoilOrganicCarbonDLayer = ImageMaptypeLayerClass.extend({

    options: {
      urlTemplate:'https://s3.amazonaws.com/wri-tiles/hwsd{/z}{/x}{/y}.png'
    }

  });

  return SoilOrganicCarbonDLayer;

});
