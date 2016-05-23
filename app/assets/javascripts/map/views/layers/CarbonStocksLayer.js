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
      this.uncertainty = (!isNaN(options.uncertainty)&&options.uncertainty !== 127) ? options.uncertainty : this.options.uncertainty,
      this._super(layer, options, map);
      this.minrange = options.minrange || this.options.minrange;
      this.maxrange = options.maxrange || this.options.maxrange;
    },

    /**
     * Filters the canvas imgdata.
     * @override
     */
    filterCanvasImgdata: function(imgdata, w, h) {
      "use asm";

      console.log(this.uncertainty,this.minrange,this.maxrange)
      // We'll force the use of a 32bit integer wit `value |0`
      // More info here: http://asmjs.org/spec/latest/
      var components = 4 | 0,
          w = w |0,
          j = j |0,
          zoom = this.map.getZoom(),
          exp = zoom < 11 ? 0.3 + ((zoom - 3) / 20) : 1 | 0;

      var myscale = d3.scale.pow()
            .exponent(exp)
            .domain([0,256])
            .range([0,256]);
      var c = [112, 168, 256, // first bucket
               76,  83,  122,
               210, 31,  38,
               241, 152, 19,
               255, 208, 11]; // last bucket
      var countBuckets = c.length / 3 |0; //3: three bands

      for(var i = 0 |0; i < w; ++i) {
        for(var j = 0 |0; j < h; ++j) {
          var pixelPos  = ((j * w + i) * components) |0,
              intensity = imgdata[pixelPos+2],
              alpha = imgdata[pixelPos + 3];
          imgdata[pixelPos + 3] = 0;

          var intensity_scaled = myscale(intensity) |0,
              bucket = (~~(countBuckets * intensity_scaled / 256) * 3);

          if (intensity > this.minrange && intensity < this.maxrange && alpha > this.uncertainty) {
            imgdata[pixelPos] = 255-intensity;
            imgdata[pixelPos + 1] = 128;
            imgdata[pixelPos + 2] = 0;
            imgdata[pixelPos + 3] = intensity
          };
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

    // Cross multiplying to get x:
    // userinput ----- 917
    // x         ----- 255
    _updateRange: function(range) {
      this.minrange = (range[0]/500)*255;
      this.maxrange = (range[1]/500)*255;

      this.presenter.updateLayer();
    }

  });

  return CarbonstocksLayer;

});
