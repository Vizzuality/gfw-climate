/**
 * The custom labels for dark basemap layer module.
 *
 * @return CustomDarkOnlyLabelsLayer class (extends ImageLayerClass)
 */
define([
  'abstract/layer/ImageLayerClass',
], function(ImageLayerClass) {

  'use strict';

  var CustomDarkOnlyLabelsLayer = ImageLayerClass.extend({

    options: {
      urlTemplate: 'http://a.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}.png'
    }

  });

  return CustomDarkOnlyLabelsLayer;

});
