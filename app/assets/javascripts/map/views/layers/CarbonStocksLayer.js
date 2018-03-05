/**
 * The Carbonstocks layer module for use on canvas.
 *
 * @return CarbonstocksLayer class (extends ImageLayerClass)
 */
define([
  'd3',
  'uri',
  'abstract/layer/CanvasLayerClass',
  'map/presenters/layers/Forest2000LayerPresenter'
], function(d3,UriTemplate, CanvasLayerClass, Presenter) {

  'use strict';

  var CarbonstocksLayer = CanvasLayerClass.extend({

    options: {
      threshold: 30,
      dataMaxZoom: 12,
      urlTemplate: 'http://storage.googleapis.com/earthenginepartners-wri/whrc-hansen-carbon-{threshold}-{z}{/x}{/y}.png',
      uncertainty: 127,
      minrange: 0,
      maxrange: 255
    },
    init: function(layer, options, map) {
      this.presenter = new Presenter(this);
      this._super(layer, options, map);
      this.threshold = options.threshold || this.options.threshold;
      this.uncertainty = (!isNaN(options.uncertainty)&&options.uncertainty !== 127) ? options.uncertainty : this.options.uncertainty;
      this._setRanges(layer, options);
    },

    /**
     * Filters the canvas imgdata.
     * @override
     */
    filterCanvasImgdata: function(imgdata, w, h) {
      "use asm";
      // We'll force the use of a 32bit integer wit `value |0`
      // More info here: http://asmjs.org/spec/latest/
      var components = 4 | 0,
          w = w |0,
          j = j |0;

      for(var i = 0 |0; i < w; ++i) {
        for(var j = 0 |0; j < h; ++j) {
          var pixelPos  = ((j * w + i) * components) |0,
          // intensity = imgdata[pixelPos+2]-(imgdata[pixelPos+3]*imgdata[pixelPos+2]/100) |0;
          intensity = imgdata[pixelPos+2];
          //if (intensity>255) intensity=255;
          //if (intensity<0) intensity=0;
          var uncer = imgdata[pixelPos + 3];
          uncer = uncer > 100 ? 100 : (uncer < 0 ? 0 : uncer);


          if(intensity >= this.minrange && intensity <= this.maxrange) {
            if(this.uncertainty === 0) {
              // min uncertainty subtract the percentage of uncertainty
              intensity = intensity - (uncer*intensity/100);
              intensity = intensity < 1 ? 1 : intensity;
            } else if(this.uncertainty === 254) {
              // max uncertainty sum the uncertainty value
              intensity = intensity + (uncer*intensity/100);
            }
            imgdata[pixelPos] = 255-intensity;
            imgdata[pixelPos + 1] = 128;
            imgdata[pixelPos + 2] = 0;
            imgdata[pixelPos + 3] = intensity;
          } else {
            imgdata[pixelPos + 3] = 0;
          }
        }
      }

    },

    setThreshold: function(threshold) {
      this.threshold = threshold;
      this.presenter.updateLayer();
    },

    _getUrl: function(x, y, z) {
      return new UriTemplate(this.options.urlTemplate)
        .fillFromObject({x: x, y: y, z: z, threshold: this.threshold});
    },
    _updateUncertainty: function(uncertainty) {
      switch(uncertainty) {
        case 'min':
          this.uncertainty = 0;
        break;
        case 'max':
          this.uncertainty = 254;
        break;
        case 'avg':
        default:
          this.uncertainty = 127;
        break;
      }
      this.presenter.updateLayer();
    },

    _setRanges: function(layer, opts) {
      var optsRange = opts.rangearray ? opts.rangearray[layer.slug] : null;

      if (optsRange) {
        this.minrange = this._getRange(optsRange.minrange);
        this.maxrange = this._getRange(optsRange.maxrange);
      } else {
        this.minrange = opts.minrange || this.options.minrange;
        this.maxrange = opts.maxrange || this.options.maxrange;
      }
    },

    // Cross multiplying to get x:
    // userinput ----- 917
    // x         ----- 255
    _getRange: function(value) {
      return (value/500)*255;
    },

    _updateRange: function(range) {
      this.minrange = this._getRange(range[0]);
      this.maxrange = this._getRange(range[1]);

      this.presenter.updateLayer();
    }

  });

  return CarbonstocksLayer;

});
