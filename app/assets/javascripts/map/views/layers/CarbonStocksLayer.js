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
      urlTemplate: 'http://storage.googleapis.com/earthenginepartners-wri/whrc-hansen-carbon-30-{z}{/x}{/y}.png'
    }

  });

  return CarbonstocksLayer;

});
