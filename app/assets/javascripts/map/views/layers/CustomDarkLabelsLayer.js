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
      urlTemplate: 'TODO: get layer from Alicia',
      dataMaxZoom: 7
    }

  });

  return CustomDarkLabelsLayer;

});
