
/**
 * slug = biomass_carbon
 *
 * @return ProtectedAreasCDBLayer class (extends CartoDBLayerClass)
 */
define([
  'abstract/layer/ImageMaptypeLayerClass',
], function(ImageMaptypeLayerClass) {

  'use strict';

  var BiomassCarbonLayer = ImageMaptypeLayerClass.extend({

    options: {
      urlTemplate:'https://storage.googleapis.com/gfw-climate-tiles/biomass/{z}/{x}/{y}.png'
    }

  });

  return BiomassCarbonLayer;

});
