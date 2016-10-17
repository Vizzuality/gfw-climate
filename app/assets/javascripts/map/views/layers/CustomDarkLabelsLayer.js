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

    //TODO: update url with this format
    // “https://{username}.carto.com/api/v1/map/named/{template_id}/{layer}/{z}/{x}/{y}.png”
    options: {
      urlTemplate: 'http://earthengine.google.org/static/hansen_2013/gain_alpha{/z}{/x}{/y}.png' //example
    }

  });

  return CustomDarkLabelsLayer;

});
