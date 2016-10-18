/**
 * The custom labels for dark basemap layer module.
 *
 * @return CustomDarkLabelsLayer class (extends ImageLayerClass)
 */
define([
  'abstract/layer/ImageLayerClass',
], function(ImageLayerClass) {

  'use strict';

  var CustomDarkLabelsLayer = ImageLayerClass.extend({

    options: {
      urlTemplate: 'https://wri-01.carto.com/api/v1/map/named/dark_baselabel_test/0/{z}/{x}/{y}.png'
    }

  });

  return CustomDarkLabelsLayer;

});
