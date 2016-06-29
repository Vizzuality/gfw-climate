/**
 * The AnalysisShapeUploadView module.
 *
 * @return AnalysisShapeUploadView class (extends Backbone.View).
 */
define([
  'backbone',
  'mps',
  'turf',
  'map/services/ShapefileService',
  'helpers/geojsonUtilsHelper'
], function(Backbone, mps, turf, ShapefileService,
    geojsonUtilsHelper) {

  'use strict';

  var AnalysisShapeUploadView = Backbone.View.extend({

    defaults: {
      fileSizeLimit: 1000000
    },

    initialize: function() {
      this.fileSizeLimit = this.defaults.fileSizeLimit;

      this.$dropable = document.getElementById('drop-shape-analysis');
      this.$fileSelector = document.getElementById('analysis-file-upload');

      this._initDroppable();
    },

    _initDroppable: function() {
      if (this.$dropable && this.$fileSelector) {
        this.$fileSelector.addEventListener('change', function() {
          var file = this.$fileSelector.files[0];
          if (file) {
            this._handleUpload(file);
          }
        }.bind(this));

        this.$dropable.addEventListener('click', function(event) {
          if (event.currentTarget.classList.contains('source')) {
             return true;
          }
        }.bind(this));

        this.$dropable.ondragover = function () {
          this.$dropable.classList.toggle('moving');
          return false;
        }.bind(this);

        this.$dropable.ondragend = function () {
          this.$dropable.classList.toggle('moving');
          return false;
        }.bind(this);

        this.$dropable.ondrop = function (e) {
          e.preventDefault();
          var file = e.dataTransfer.files[0];
          this._handleUpload(file);
          return false;
        }.bind(this);
      }
    },

    _handleUpload: function(file) {
      var sizeMessage = 'The selected file is quite large and uploading ' +
        'it might result in browser instability. Do you want to continue?';

      if (file.size > this.fileSizeLimit && !window.confirm(sizeMessage)) {
        this.$dropable.classList.remove('moving');
        return;
      }

      mps.publish('Spinner/start', []);

      var shapeService = new ShapefileService({ shapefile: file });
      shapeService.toGeoJSON().then(function(data) {
        var combinedFeatures = data.features.reduce(turf.union);
        var bounds = geojsonUtilsHelper.getBoundsFromGeojson(combinedFeatures);

        mps.publish('Analysis/upload', [combinedFeatures.geometry]);

        this.trigger('analysis:shapeUpload:draw', combinedFeatures);
        this.trigger('analysis:shapeUpload:fitBounds', bounds);
      }.bind(this));

      this.$dropable.classList.remove('moving');
    }
  });

  return AnalysisShapeUploadView;
});
