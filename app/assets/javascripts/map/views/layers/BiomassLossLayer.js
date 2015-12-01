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
      var components = 4;
      var exp = z < 11 ? 0.3 + ((z - 3) / 20) : 1;
      if (! !!this.currentDate[0]._d) {
       this.currentDate[0] = moment(this.currentDate[0]);
       this.currentDate[1] = moment(this.currentDate[1]);
      }
      var yearStart = this.currentDate[0].year();
      var yearEnd = this.currentDate[1].year();

      var myscale = d3.scale.pow()
         .exponent(exp)
         .domain([0,256])
         .range([0,256]);

      for(var i = 0; i < w; ++i) {
       for(var j = 0; j < h; ++j) {
         var pixelPos = (j * w + i) * components;
         var intensity = imgdata[pixelPos+1];
         var yearLoss = 2001 + imgdata[pixelPos];

         //intensity=z < 13 ? (intensity)=Math.pow (2, (12-z)) : intensity;

       

         if (yearLoss >= yearStart && yearLoss <= yearEnd) {
           
          imgdata[pixelPos] = 0;
          if (myscale(intensity) < 1){
               imgdata[pixelPos + 3] = imgdata[pixelPos + 2] = imgdata[pixelPos + 1] = 0;
           }
          else if (myscale(intensity) < 50){
               imgdata[pixelPos + 1] = 112;
               imgdata[pixelPos + 2] = 168;
               imgdata[pixelPos + 3] = 256;
          }
          else if (myscale(intensity) < 100){
               imgdata[pixelPos]     = 76;
               imgdata[pixelPos + 1] = 83; 
               imgdata[pixelPos + 2] = 122;
               imgdata[pixelPos + 3] = 255;
           }
          else if (myscale(intensity) < 150){
               imgdata[pixelPos]     = 210;
               imgdata[pixelPos + 1] = 31; 
               imgdata[pixelPos + 2] = 38;
               imgdata[pixelPos + 3] = 255;
          }
          else if (myscale(intensity) < 200){
               imgdata[pixelPos]     = 241;
               imgdata[pixelPos + 1] = 152;
               imgdata[pixelPos + 2] = 19;
               imgdata[pixelPos + 3] = 255;
          }
          else if (myscale(intensity) < 256){
               imgdata[pixelPos + 3] = imgdata[pixelPos] = 255;
               imgdata[pixelPos + 1] = 208;
               imgdata[pixelPos + 2] = 11;
          }
        } else {
          imgdata[pixelPos + 3] = 0;
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
