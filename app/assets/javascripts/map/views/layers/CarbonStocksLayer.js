/**
 * The Carbonstocks layer module for use on canvas.
 *
 * @return CarbonstocksLayer class (extends ImageLayerClass)
 */
define(
  [
    'd3',
    'uri',
    'abstract/layer/CanvasLayerClass',
    'map/presenters/layers/Forest2000LayerPresenter'
  ],
  function(d3, UriTemplate, CanvasLayerClass, Presenter) {
    'use strict';

    var CarbonstocksLayer = CanvasLayerClass.extend({
      options: {
        threshold: 30,
        dataMaxZoom: 12,
        urlTemplate:
          'https://storage.googleapis.com/wri-public/biomass/2017/v1/{threshold}/{z}/{x}/{y}.png',
        uncertainty: 127,
        minrange: 0,
        maxrange: 255
      },
      init: function(layer, options, map) {
        this.presenter = new Presenter(this);
        this._super(layer, options, map);
        this.threshold = options.threshold || this.options.threshold;
        this.uncertainty =
          !isNaN(options.uncertainty) && options.uncertainty !== 127
            ? options.uncertainty
            : this.options.uncertainty;
        this._setRanges(layer, options);
      },

      /**
       * Filters the canvas imgdata.
       * @override
       */
      filterCanvasImgdata: function(imgdata, w, h) {
        'use asm';
        // We'll force the use of a 32bit integer wit `value |0`
        // More info here: http://asmjs.org/spec/latest/
        var components = 4 | 0,
          w = w | 0,
          j = j | 0;

        // create buckets
        var buckets = [
          39,
          11,
          3, // first bucket R G B
          83,
          44,
          8,
          130,
          104,
          26,
          174,
          176,
          49,
          173,
          209,
          81,
          179,
          249,
          122
        ]; // last bucket
        // cache bucket length
        var countBuckets = (buckets.length / 3) | 0;

        for (var i = 0 | 0; i < w; ++i) {
          for (var j = 0 | 0; j < h; ++j) {
            // find pixel position
            var pixelPos = ((j * w + i) * components) | 0,
              // get values from imgdata
              carbonStock = imgdata[pixelPos + 2] | 0,
              uncertainty = imgdata[pixelPos + 3] | 0;
            // scale values
            uncertainty =
              uncertainty > 100 ? 100 : uncertainty < 0 ? 0 : uncertainty;
            // init set alpha to 0
            imgdata[pixelPos + 3] = 0;

            if (carbonStock >= this.minrange && carbonStock <= this.maxrange) {
              if (this.uncertainty === 0) {
                // min uncertainty subtract the percentage of uncertainty
                carbonStock = carbonStock - uncertainty * carbonStock / 100;
                carbonStock = carbonStock < 1 ? 1 : carbonStock;
              } else if (this.uncertainty === 254) {
                // max uncertainty sum the uncertainty value
                carbonStock = carbonStock + uncertainty * carbonStock / 100;
              }
              // Calc bucket from carbonStock as a factor of bucket number
              var bucket = carbonStock * countBuckets / this.options.maxrange;
              // Find floor to give bucket index
              var bucketIndex = ~~bucket;
              imgdata[pixelPos] = buckets[bucketIndex * 3];
              imgdata[pixelPos + 1] = buckets[bucketIndex * 3 + 1];
              imgdata[pixelPos + 2] = buckets[bucketIndex * 3 + 2];
              imgdata[pixelPos + 3] = carbonStock;
            }
          }
        }
      },

      setThreshold: function(threshold) {
        this.threshold = threshold;
        this.presenter.updateLayer();
      },

      _getUrl: function(x, y, z) {
        return new UriTemplate(this.options.urlTemplate).fillFromObject({
          x: x,
          y: y,
          z: z,
          threshold: this.threshold
        });
      },
      _updateUncertainty: function(uncertainty) {
        switch (uncertainty) {
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
          this.maxrange = opts.maxrange || this.options.maxrange;
        }
      },

      // Cross multiplying to get x:
      // userinput ----- 917
      // x         ----- 255
      _getRange: function(value) {
        return value / 500 * 255;
      },

      _updateRange: function(range) {
        this.minrange = this._getRange(range[0]);
        this.maxrange = this._getRange(range[1]);

        this.presenter.updateLayer();
      }
    });

    return CarbonstocksLayer;
  }
);
