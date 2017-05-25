
/**
 *  May 2017
 *  Slug for these data will be total_carbon
 *
 * @return ProtectedAreasCDBLayer class (extends CartoDBLayerClass)
 */
define([
  'abstract/layer/ImageMaptypeLayerClass',
], function(ImageMaptypeLayerClass) {

  'use strict';

  var TotalCarbonLayer = ImageMaptypeLayerClass.extend({

    options: {
      urlTemplate:"https://storage.googleapis.com/gfw-climate-tiles/total_carbon/{z}/{x}/{y}.png"
    }

  });

  return TotalCarbonLayer;

});
