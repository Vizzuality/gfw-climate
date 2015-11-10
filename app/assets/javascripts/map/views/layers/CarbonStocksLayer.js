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
      urlTemplate: 'http://earthengine.google.org/static/hansen_2013/gain_alpha{/z}{/x}{/y}.png'
    }

  });

  return CarbonstocksLayer;

});
