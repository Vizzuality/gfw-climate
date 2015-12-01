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
      urlTemplate: 'http://storage.googleapis.com/earthenginepartners-wri/whrc-hansen-carbon-{threshold}-{z}{/x}{/y}.png'
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
      this._super(layer, options, map);
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
          exp = z < 11 ? 0.3 + ((z - 3) / 20) : 1 | 0;

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

      for(var i = 0 |0; i < w; ++i) {
       for(var j = 0 |0; j < h; ++j) {
         var pixelPos = ((j * w + i) * components) |0,
             intensity = imgdata[pixelPos+1] |0,
             intensity_scaled = myscale(intensity) |0,
             yearLoss = 2001 + imgdata[pixelPos] |0;

         //intensity=z < 13 ? (intensity)=Math.pow (2, (12-z)) : intensity;

         if (yearLoss >= yearStart && yearLoss <= yearEnd) {
          imgdata[pixelPos] = 0 | 0;
          if (intensity_scaled < 1){
               imgdata[pixelPos + 3] = imgdata[pixelPos + 2] = imgdata[pixelPos + 1] = 0;
           }
          else if (intensity_scaled < 50){
               imgdata[pixelPos + 1] = 112 | 0;
               imgdata[pixelPos + 2] = 168 | 0;
               imgdata[pixelPos + 3] = 256 | 0;
          }
          else if (intensity_scaled < 100){
               imgdata[pixelPos]     = 76 | 0;
               imgdata[pixelPos + 1] = 83 | 0; 
               imgdata[pixelPos + 2] = 122 | 0;
               imgdata[pixelPos + 3] = 255 | 0;
           }
          else if (intensity_scaled < 150){
               imgdata[pixelPos]     = 210 | 0;
               imgdata[pixelPos + 1] = 31 | 0; 
               imgdata[pixelPos + 2] = 38 | 0;
               imgdata[pixelPos + 3] = 255 | 0;
          }
          else if (intensity_scaled < 200){
               imgdata[pixelPos]     = 241 | 0;
               imgdata[pixelPos + 1] = 152 | 0;
               imgdata[pixelPos + 2] = 19 | 0;
               imgdata[pixelPos + 3] = 255 | 0;
          }
          else if (intensity_scaled < 256){
               imgdata[pixelPos + 3] = imgdata[pixelPos] = 255 | 0;
               imgdata[pixelPos + 1] = 208 | 0;
               imgdata[pixelPos + 2] = 11 | 0;
          }
        } else {
          imgdata[pixelPos + 3] = 0 | 0;
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
    }

  });

  return BiomassLossLayer;
});
