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
      urlTemplate: 'http://storage.googleapis.com/thau_wri_carbon_for_vizz/full50{z}{/x}{/y}.png'
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
           
           if (myscale(intensity) <255){
               imgdata[pixelPos] = 189;
               imgdata[pixelPos + 1] = 0;
               imgdata[pixelPos + 2] = 38;
           }
            if (myscale(intensity) <180){
               imgdata[pixelPos] = 240;
               imgdata[pixelPos + 1] = 59;
               imgdata[pixelPos + 2] = 32;
           }
           if (myscale(intensity) <100){
               imgdata[pixelPos] = 253;
               imgdata[pixelPos + 1] = 141;
               imgdata[pixelPos + 2] = 60;
           }
            if (myscale(intensity) <50){
               imgdata[pixelPos] = 240;
               imgdata[pixelPos + 1] = 59;
               imgdata[pixelPos + 2] = 32;
           }
            if (myscale(intensity) <20){
               imgdata[pixelPos] = 255;
               imgdata[pixelPos + 1] = 255;
               imgdata[pixelPos + 2] = 178;
           }
           
           imgdata[pixelPos + 3] = z < 13 ? myscale(intensity) : intensity;;
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
