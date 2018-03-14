/**
 * The custom labels for dark basemap layer module.
 *
 * @return CustomDarkBaseLabelsLayer class (extends ImageLayerClass)
 */
define(['abstract/layer/ImageLayerClass'], function(ImageLayerClass) {
  'use strict';

  var CustomDarkBaseLabelsLayer = ImageLayerClass.extend({
    options: {
      urlTemplate:
        'https://wri-01.carto.com/api/v1/map/named/dark_baselabel/{z}/{x}/{y}.png'
    }
  });

  return CustomDarkBaseLabelsLayer;
});
