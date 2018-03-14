/**
 * The Forest2000 layer module for use on canvas.
 *
 * @return ForestLayer class (extends CanvasLayerClass)
 */
define(
  [
    'd3',
    'uri',
    'abstract/layer/CanvasLayerClass',
    'map/presenters/layers/TerraiCanvasLayerPresenter'
  ],
  function(d3, UriTemplate, CanvasLayerClass, Presenter) {
    'use strict';

    var TerraiCanvasLayer = CanvasLayerClass.extend({
      options: {
        threshold: 30,
        dataMaxZoom: 11,
        //ATTENTION: check config.ru file to get the whole route, reverse proxying here
        //urlTemplate: '/latin-america/Z{z}/{y}/{x}.png'
        urlTemplate:
          'https://s3.amazonaws.com/wri-tiles/latin-decrease-current/{z}/{x}/{y}.png'
      },

      init: function(layer, options, map) {
        this.presenter = new Presenter(this);
        this.currentDate = options.currentDate || [
          layer.mindate,
          layer.maxdate
        ];
        this._super(layer, options, map);
        this.top_date =
          (moment(layer.maxdate).year() - 2004) * 23 +
          Math.floor(moment(layer.maxdate).dayOfYear() / 16);
        this.top_date -= 16;
      },

      /**
       * Filters the canvas imgdata.
       * @override
       */
      filterCanvasImgdata: function(imgdata, w, h) {
        var components = 4;
        var start =
          (moment(this.currentDate[0]).year() - 2004) * 23 +
          Math.ceil((moment(this.currentDate[0]).dayOfYear() - 1) / 16);
        if (start < 1) start = 1;
        var end =
          (moment(this.currentDate[1]).year() - 2004) * 23 +
          Math.floor((moment(this.currentDate[1]).dayOfYear() - 1) / 16);
        for (var i = 0; i < w; ++i) {
          for (var j = 0; j < h; ++j) {
            var pixelPos = (j * w + i) * components;
            // var r = imgdata[pixelPos]; //left here for coherence
            var g = imgdata[pixelPos + 1];
            var b = imgdata[pixelPos + 2];
            // var timeLoss = b+(256*g); //old method, just in case, because we like the feeling of nostalgia
            var timeLoss = null;

            if (b > 0) {
              timeLoss = b;
            } else if (g > 0) {
              timeLoss = g + 255;
            }
            //var timeLoss = b+g;

            if (timeLoss >= start && timeLoss <= end) {
              imgdata[pixelPos] = 220;
              imgdata[pixelPos + 1] = 102;
              imgdata[pixelPos + 2] = 153;
              imgdata[pixelPos + 3] = 256;
              if (timeLoss > this.top_date) {
                imgdata[pixelPos] = 233;
                imgdata[pixelPos + 1] = 189;
                imgdata[pixelPos + 2] = 21;
              }
            } else {
              imgdata[pixelPos + 3] = 0;
            }
          }
        } //end first for loop
      },

      /**
       * Used by TerraiCanvasLayerPresenter to set the dates for the tile.
       *
       * @param {Array} date 2D array of moment dates [begin, end]
       */
      setTimelineDate: function(date) {
        this.currentDate = date;
        this.updateTiles();
      }
    });

    return TerraiCanvasLayer;
  }
);
