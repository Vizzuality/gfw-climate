/**
 * The Carbonstocks layer module for use on canvas.
 *
 * @return CarbonstocksLayer class (extends ImageLayerClass)
 */
define([
  'abstract/layer//ImageLayerClass',
], function(ImageLayerClass) {

  'use strict';

  var CarbonstocksLayer = ImageLayerClass.extend({

    options: {
      dataMaxZoom: 12,
      urlTemplate: 'http://storage.googleapis.com/thau_wri_carbon_for_vizz/full50{z}{/x}{/y}.png'
    }

  });

  return CarbonstocksLayer;

});
