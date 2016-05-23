/**
 * The UMD loss map layer view.
 *
 * @return BiomassLossLayer class (extends CanvasLayerClass)
 */
define([
  'd3',
  'moment',
  'uri',
  'abstract/layer/CanvasLayerClass',
  'map/presenters/layers/UMDLossLayerPresenter'
], function(d3, moment, UriTemplate, CanvasLayerClass, Presenter) {

  'use strict';

  var BiomassLossLayer = CanvasLayerClass.extend({

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
      if (!! options.currentDate && (options.currentDate[0] > options.currentDate[1])) {
        var kllm = options.currentDate[1];
        options.currentDate[1] = options.currentDate[0];
        options.currentDate[0] = kllm;
        kllm = null;
      }
      this.currentDate = options.currentDate || [moment(layer.mindate), moment(layer.maxdate)];
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
    filterCanvasImgdata: function(imgdata, w, h, z) {
      "use asm";
      // We'll force the use of a 32bit integer wit `value |0`
      // More info here: http://asmjs.org/spec/latest/
      var components = 4 | 0,
          w = w |0,
          j = j |0,
          z = z |0,
          exp = z < 11 ? 0.3 + ((z - 6) / 20) : 1 | 0;

      if (! !!this.currentDate[0]._d) {
       this.currentDate[0] = moment(this.currentDate[0]);
       this.currentDate[1] = moment(this.currentDate[1]);
      }
      var yearStart = this.currentDate[0].year(),
          yearEnd = this.currentDate[1].year();

      var myscale = d3.scale.pow()
         .exponent(exp)
         .domain([0,256])
         .range([0,256]);
      var c = [255, 31,  38, // first bucket R G B
               210, 31,  38,
               210, 31,  38,
               241, 152, 19,
               255, 208, 11]; // last bucket
      var countBuckets = c.length / 3 |0; //3: three bands
      for(var i = 0 |0; i < w; ++i) {
       for(var j = 0 |0; j < h; ++j) {
          var pixelPos  = ((j * w + i) * components) |0,
              intensity = imgdata[pixelPos+1] |0,
              alpha = imgdata[pixelPos + 3];
              imgdata[pixelPos + 3] = 0 |0;
          if (intensity > this.minrange && intensity < this.maxrange && alpha > this.uncertainty) {
            var intensity_scaled = myscale(intensity) |0,
                yearLoss = 2000 + imgdata[pixelPos] |0;
            if (yearLoss >= yearStart && yearLoss <= yearEnd) {
              var bucket = (~~(countBuckets * intensity_scaled / 256) * 3);
              imgdata[pixelPos] = c[bucket]; //R 0-255
              imgdata[pixelPos + 1] = c[bucket + 1]; //G 0-255
              imgdata[pixelPos + 2] = c[bucket + 2]; //B 0-255
              imgdata[pixelPos + 3] = intensity_scaled | 0; //alpha channel 0-255
            }
          }
        }
       }
    },

    /**
     * Used by UMDLoassLayerPresenter to set the dates for the tile.
     *
     * @param {Array} date 2D array of moment dates [begin, end]
     */
    setCurrentDate: function(date) {
      this.currentDate = date;
      this.updateTiles();
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
      this.minrange = (range[0]/917)*255;
      this.maxrange = (range[1]/917)*255;

      this.presenter.updateLayer();
    }

  });

  return BiomassLossLayer;
});
