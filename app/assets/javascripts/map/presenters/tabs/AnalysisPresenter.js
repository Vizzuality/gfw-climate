/**
 * The AnalysisToolPresenter class for the AnalysisToolView.
 *
 * @return AnalysisToolPresenter class.
 */
define([
  'map/presenters/PresenterClass',
  'underscore',
  'backbone',
  'mps',
  'topojson',
  'bluebird',
  'helpers/geojsonUtilsHelper',
  'map/services/CountryService',
  'map/services/RegionService',
  'map/services/GeostoreService'
], function(PresenterClass, _, Backbone, mps, topojson, bluebird,
  geojsonUtilsHelper, countryService, regionService, GeostoreService) {

  'use strict';

  var StatusModel = Backbone.Model.extend({
    defaults: {
      baselayer: null,
      both: false,
      resource: null, // analysis resource
      date: null,
      threshold: 30, // by default
      iso: null,
      overlay: null, // google.maps.Polygon (user drawn polygon)
      multipolygon: null, // geojson (countries and regions multypolygon)
      disableUpdating: false,
      dont_analyze: false
    }
  });

  var concessionsSql = {
    'logging': 'http://wri-01.cartodb.com/api/v2/sql/?q=SELECT ST_AsGeoJSON(the_geom) from gfw_logging where cartodb_id ={0}',
    'mining':'http://wri-01.cartodb.com/api/v2/sql/?q=SELECT ST_AsGeoJSON(the_geom) from gfw_mining where cartodb_id ={0}',
    'oilpalm': 'http://wri-01.cartodb.com/api/v2/sql/?q=SELECT ST_AsGeoJSON(the_geom) from gfw_oil_palm where cartodb_id ={0}',
    'fiber': 'http://wri-01.cartodb.com/api/v2/sql/?q=SELECT ST_AsGeoJSON(the_geom) from gfw_wood_fiber where cartodb_id ={0}'
  };

  var AnalysisToolPresenter = PresenterClass.extend({

    datasets: {
      'biomass_loss': 'biomass-loss',
    },

    usenames: ['mining', 'oilpalm', 'fiber', 'logging'],

    init: function(view) {
      this.view = view;
      this.status = new StatusModel();
      this._super();
      mps.publish('Place/register', [this]);
    },

    /**
     * Application subscriptions.
     */
    _subscriptions: [{
      'Geostore/go': function(geostore) {
        this.status.set('geostore', geostore.data.attributes.hash);
        this._handlePlaceGo(geostore.data.attributes);
      }
    }, {
      'Place/go': function(place) {
        this._setBaselayer(place.layerSpec.getBaselayers());
        this.status.set('date', [place.params.begin, place.params.end]);
        this.status.set('threshold', place.params.threshold);
        this.status.set('dont_analyze', place.params.dont_analyze);
        this._handlePlaceGo(place.params);
      }
    }, {
      'LayerNav/change': function(layerSpec) {
        var baselayer = this.status.get('baselayer');
        var both = this.status.get('both');
        this._setBaselayer(layerSpec.getBaselayers());
        if (this.status.get('baselayer') != baselayer) {
          this._updateAnalysis();
          this.openAnalysisTab();
        }else{
          if (this.status.get('both') != both) {
            this._updateAnalysis();
            this.openAnalysisTab();
          }
        }
      }
    }, {
      'AnalysisTool/update-analysis': function() {
        this._updateAnalysis();
      }
    }, {
      'AnalysisResults/delete-analysis': function() {
        this.deleteAnalysis();
      }
    }, {
      'AnalysisTool/analyze-wdpaid': function(wdpaid) {
        this.openAnalysisTab(true);
        this.view._stopDrawing();
        this.deleteAnalysis();
        this._analyzeWdpai(wdpaid.wdpaid);
      }
    }, {
      'AnalysisTool/analyze-concession': function(useid, layerSlug, wdpaid) {
        if (wdpaid && wdpaid != "") {
          wdpaid = {wdpaid : wdpaid}
          mps.publish('AnalysisTool/analyze-wdpaid', [wdpaid]);
          return;
        }
        this.openAnalysisTab(true);
        this.view._stopDrawing();
        this.deleteAnalysis();
        this._analyzeConcession(useid, layerSlug);
      }
    }, {
      'Timeline/date-change': function(layerSlug, date) {
        this.status.set('date', date);
        this.openAnalysisTab();
        this._updateAnalysis();
      }
    }, {
      'Timeline/start-playing': function() {
        this.status.set('disableUpdating', true);
      }
    }, {
      'Timeline/stop-playing': function() {
        this.status.set('disableUpdating', false);
        this._updateAnalysis();
      }
    }, {
      'Threshold/changed': function(threshold) {
        this.status.set('threshold', threshold);
        this.openAnalysisTab();
        this._updateAnalysis();
      }
    },{
      'Tab/opened': function(id) {
        if (id === 'analysis-tab') {
          this.view.model.set('hidden',false);
        }else{
          if (this.view.model.get('is_drawing')) {
            this.view._stopDrawing();
            this.deleteAnalysis();
            this.view.model.set('hidden',true);
          }
        }
      },
    },{
      'Countries/changeIso': function(iso,analyze) {
        this.status.set('dont_analyze', analyze);
        if (!!iso.country) {
          this.deleteAnalysis();
          this._analyzeIso(iso);
        }else{
          mps.publish('LocalMode/updateIso',[iso, this.status.get('dont_analyze')]);
          this.deleteAnalysis();
        }

      }
    },{
      'Analysis/toggle': function() {
        this.view.toggleAnalysis(this.view.$el.hasClass('is-analysis'));
      }
    },{
      'Analysis/upload': function(geojson) {
        ga('send', 'event', 'Map', 'Analysis', 'Upload Shapefile');
        this._saveAndAnalyzeGeojson(geojson, {draw: true});
      }
    },{
      'Subscribe/end' : function(){
        this.view.setStyle();
      }
    }, {
      'Dialogs/close': function() {
        this.view.toggleAnalysis(true);
      }
    }],

    openAnalysisTab: function(open){
      var open = open || this.view.$el.hasClass('is-analysis');
      if (open) {
        mps.publish('Tab/open', ['#analysis-tab-button']);
      }
    },


    /**
     * Handles a Place/go.
     *
     * @param  {Object} params Place params
     */
    _handlePlaceGo: function(params) {
      // this.deleteAnalysis();

      //Open analysis tab
      if ((!this.status.get('dont_analyze') && (params.iso &&
        params.iso.country && params.iso.country !== 'ALL')) ||
        (params.analyze || params.geojson || params.wdpaid)) {
        mps.publish('Tab/open', ['#analysis-tab-button']);
      }

      //Select analysis type by params given
      if (params.analyze && params.name === 'map') {
        this.view.onClickAnalysis();
      } else if (params.iso && params.iso.country && params.iso.country !== 'ALL') {
        if (params.geojson) {
          this._analyzeIso(params.iso);
          this._analyzeGeojson(params.geojson);
        }else{
          this._analyzeIso(params.iso);
        }
      } else if (params.geostore) {
         this.status.set('geostore', params.geostore);
      } else if (params.geojson) {
        var geojson = this._getGeomFromGeoJSON(params.geojson);
        if (geojson) {
          this._analyzeGeojson(geojson);
        }
      } else if (params.wdpaid) {
        this._analyzeWdpai(params.wdpaid);
      }
    },

    _getGeomFromGeoJSON: function(geojson) {
      var geom = {};

      if (geojson && geojson.features && geojson.features[0]) {
        geom = _.clone(geojson.features[0].geometry);
      }
      return geom;
    },

    /**
     * Analyzes a geojson object.
     *
     * @param  {[type]} geojson [description]
     */
    _analyzeGeojson: function(geojson, options) {
      options = options || {draw: true};

      // Build resource
      var resource = {
        geojson: JSON.stringify(geojson),
        type: 'geojson'
      };
      resource = this._buildResource(resource);

      // Draw geojson if needed.
      if (options.draw) {
        this.view.drawPaths(
          geojsonUtilsHelper.geojsonToPath(geojson));
      }

      // Publish analysis
      ga('send', 'event', 'Map', 'Analysis', 'Layer: ' + resource.dataset + ', Polygon: true');
      this._publishAnalysis(resource);
    },

    _saveAndAnalyzeGeojson: function(geojson, options) {
      mps.publish('Spinner/start');
      GeostoreService.save(geojson)
        .then(function(geostoreId) {
          this.status.set('geostore', geostoreId);
          this._analyzeGeojson(geojson, options);
        }.bind(this))
        .catch(function(e) {
          mps.publish('AnalysisService/results', [{unavailable: true}]);
        })
    },

    /**
     * Analyze country/region by iso.
     *
     * @param  {Object} iso {country: {string}, id: {integer}}
     */
    _analyzeIso: function(iso) {
      this.deleteAnalysis();

      this.view.setSelects(iso, this.status.get('dont_analyze'));
      mps.publish('LocalMode/updateIso', [iso, this.status.get('dont_analyze')]);

      // Build resource
      var resource = {
        iso: iso.country,
        type: 'iso'
      };
      if (iso.region) {
        resource.id1 = iso.region;
      }
      resource = this._buildResource(resource);
      ga('send', 'event', 'Map', 'Analysis', 'Layer: ' + resource.dataset + ', Iso: ' + resource.iso.country);

      //Pan map to selected country.
      if (!iso.region) {
        // Get geojson/fit bounds/draw geojson/publish analysis.
        countryService.execute(resource.iso, _.bind(function(results) {
          var objects = _.findWhere(results.topojson.objects, {
            type: 'MultiPolygon'
          });

          var geojson = topojson.feature(results.topojson,
            objects);
          this._geojsonFitBounds(geojson);
          mps.publish('Subscribe/geom',[geojson]);

          // Always draw the country shape regardless of the tab
          this.view.drawCountrypolygon(geojson,'#5B80A0');

          if (!this.status.get('dont_analyze')) {
            this.view._removeCartodblayer();
            this._publishAnalysis(resource);
          }else{
            mps.publish('Spinner/stop');
          }

        },this));
      } else {
        regionService.execute(resource, _.bind(function(results) {
          var geojson = results.features[0];
          this._geojsonFitBounds(geojson);
          mps.publish('Subscribe/geom',[geojson]);

          if (!this.status.get('dont_analyze')) {
            this.view.drawCountrypolygon(geojson,'#5B80A0');
            this.view._removeCartodblayer();
            this._publishAnalysis(resource);
          }else{
            mps.publish('Spinner/stop');
          }

        },this));
      }
    },

    setAnalyzeIso: function(iso){
      this.status.set('dont_analyze', null);
      mps.publish('Analysis/analyze-iso', [iso, this.status.get('dont_analyze')]);
      mps.publish('Countries/changeIso',[iso,this.status.get('dont_analyze')]);
    },

    setSubscribeIso: function(iso){
      mps.publish('Subscription/iso', [iso]);
    },

    _analyzeWdpai: function(wdpaid) {
      // Build resource

      this.wdpaidBool = (this.wdpaid == wdpaid) ? false : true;
      this.wdpaid = wdpaid;

      if (this.wdpaidBool) {
        var resource = this._buildResource({
          wdpaid: wdpaid,
          type: 'other',
          geostore: null
        });

        ga('send', 'event', 'Map', 'Analysis', 'Layer: ' + resource.dataset + ', Wdpaid: ' + resource.wdpaid);
        // Get geojson/fit bounds/draw geojson/publish analysis
        var url = 'http://wri-01.cartodb.com/api/v2/sql/?q=SELECT ST_AsGeoJSON(the_geom) from wdpa_protected_areas where wdpaid =' + wdpaid;
        $.getJSON(url, _.bind(function(data) {
          if (data.rows.length > 0) {
            var geojson = {
              geometry: JSON.parse(data.rows[0].st_asgeojson),
              properties: {},
              type: 'Feature'
            };

            this._geojsonFitBounds(geojson);
            this.view.drawMultipolygon(geojson);
            this._publishAnalysis(resource);

            this.wdpaid = null;
            this.wdpaidBool = true;

          } else {
            this._publishAnalysis(resource, true);
          }
        }, this));
      }
    },

    /**
     * Analyze a concession.
     *
     * @param  {integer} useid Carto db id
     */
    _analyzeConcession: function(useid, layerSlug) {
      var resource = this._buildResource({
        useid: useid,
        use: layerSlug,
        type: 'other'
      });

      ga('send', 'event', 'Map', 'Analysis', 'Layer: ' + resource.dataset + ', ConcessionLayer: ' + resource.use + ', ConcessionId: ' + resource.useid);

      var url = function() {
        if (!!concessionsSql[layerSlug])
          return concessionsSql[layerSlug].format(useid);
        else
          return 'http://wri-01.cartodb.com/api/v2/sql/?q=SELECT ST_AsGeoJSON(the_geom) from '+ layerSlug +' where cartodb_id =' + useid;
      }();

      $.getJSON(url, _.bind(function(data) {
        if (data.rows.length > 0) {
          var geojson = {
            geometry: JSON.parse(data.rows[0].st_asgeojson),
            properties: {},
            type: 'Feature'
          };

          this._geojsonFitBounds(geojson);
          this.view.drawMultipolygon(geojson);
          if (!!layerSlug && this.usenames.indexOf(layerSlug) === -1) {
            var provider = {
              table: layerSlug,
              filter: 'cartodb_id = ' + useid,
              user: 'wri-01',
              type: 'carto'
            };
            GeostoreService.use(provider).then(function(useGeostoreId) {
              if (useGeostoreId) {
                resource.use = null;
                resource.useid = null;
                resource.type = 'world';
                resource.geostore = useGeostoreId;
                this._publishAnalysis(resource);
              } else {
                this._publishAnalysis(resource, true);
              }
            }.bind(this));
          } else {
            this._publishAnalysis(resource);
          }

        } else {
          this._publishAnalysis(resource, true);
        }
      }, this));
    },

    /**
     * Get the geojson from the current geom and check valid size
     */
    isValidDraw: function() {
      var overlay = this.status.get('overlay');
      return overlay.getPath().getArray().length >= 3; // LinearRing of coordinates needs to have four or more positions
    },

    /**
     * Get the geojson from the current and analyze
     * that geojson without drawing again the geom.
     */
    doneDrawing: function() {
      var overlay = this.status.get('overlay');
      var paths = overlay.getPath().getArray();
      var geojson = geojsonUtilsHelper.pathToGeojson(paths);
      var wrappedGeoJSON = geojsonUtilsHelper.wrapInCollection(geojson);

      this.view.setEditable(overlay, false);
      // this._analyzeGeojson(geojson, {draw: false});
      this._saveAndAnalyzeGeojson(wrappedGeoJSON, {draw: false});
    },

    /**
     * Build a resource, adding extra options
     * from the current status.
     */
    _buildResource: function(resource) {
      mps.publish('Spinner/start');
      var date, dateFormat;
      var baselayer = this.status.get('baselayer');

      // Return resource if there isn't a baselayer
      // so we can build the resource later
      // and display a 'unsupported layer' message.
      if (!baselayer) {
        return resource;
      }

      if (this.status.get('geostore')) {
        resource.geostore = this.status.get('geostore');
      }

      if (baselayer.slug !== 'forestgain') {
        // Append dataset string
        resource.dataset = this.datasets[baselayer.slug];

        // Append period
        date = this.status.get('date');
        dateFormat = 'YYYY-MM-DD';

        // period format = 2012-12-23,2013-01-4
        date[0] = (date[0] != null) ? ((!!date[0]._isAMomentObject) ? date[0] : date[0].substr(0,10)) : '2001-01-01';
        date[1] = (date[1] != null) ? ((!!date[1]._isAMomentObject) ? date[1] : date[1].substr(0,10)) : '2014-12-31';
        resource.period = '{0},{1}'.format(date[0].format(dateFormat), date[1].format(dateFormat));
        resource.begin = date[0];
        resource.end = date[1];

        // this is super ugly
        if (baselayer.slug === 'biomass_loss') {
          resource.thresh = ((this.status.get('threshold') === null) ? 30 :  this.status.get('threshold'));
        } else {
          delete resource.thresh;
        }

        return resource;
      } else {
        // Append dataset string
        resource.dataset = this.datasets[baselayer.slug];

        // Append period
        date = ['2001-01-01','2013-12-31'];

        // period format = 2012-12-23,2013-01-4
        resource.period = '{0},{1}'.format(
          date[0], date[1]);

        // this is super ugly
        resource.thresh = '?thresh=' + this.status.get('threshold');

        return resource;

      }
    },

    /**
     * Publish an analysis form a suplied resource.
     *
     * @param  {Object} resource The analysis resource
     */
    _publishAnalysis: function(resource, failed) {
      this.status.set('resource', resource);
      // this._setAnalysisBtnVisibility();
      mps.publish('Place/update', [{go: false}]);
      //Open tab of analysis
      this.view.openTab(resource.type);

      if (!this.status.get('baselayer') || failed) {
        mps.publish('AnalysisService/results', [{unavailable: true}]);
      } else {
        mps.publish('AnalysisService/get', [resource]);
      }
    },

    /**
     * Updates current analysis if it's permitted.
     */
    _updateAnalysis: function() {
      var resource = this.status.get('resource');

      if (resource && !this.status.get('disableUpdating')) {
        resource = this._buildResource(resource);
        // (resource.iso) ? this.view.putMaskOnTop() : null;
        this._publishAnalysis(resource);
      }
    },

    /**
     * Deletes the current analysis.
     */
    deleteAnalysis: function() {
      mps.publish('AnalysisResults/Delete');
      this.view._removeCartodblayer();
      this.view.$el.removeClass('is-analysis');
      // if(!this.status.get('dont_analyze')){
      //   console.log('cause');
      //   mps.publish('Analysis/toggle')
      // }
      // Delete overlay drawn or multipolygon.
      this.view.deleteGeom({
        overlay: this.status.get('overlay'),
        multipolygon: this.status.get('multipolygon')
      });

      this.view.setSelects({ country: null, region: null });

      // Reset status model
      this.status.set({
        resource: null,
        overlay: null,
        polygon: null,
        multipolygon: null
      });

      this._setAnalysisBtnVisibility();
    },

    resetIsos: function(){
      mps.publish('LocalMode/updateIso', [{country:null, region:null}])
    },

    /**
     * Set the status.baselayer from layerSpec.
     *
     * @param {Object} baselayers Current active baselayers
     */
    _setBaselayer: function(baselayers) {
      var baselayer;
      baselayer = baselayers[_.first(_.intersection(
        _.pluck(baselayers, 'slug'),
        _.keys(this.datasets)))];
      $('#analyzeBtn').toggleClass('dont-analyze', !!!baselayer);
      this.status.set('baselayer', baselayer);
      this._setAnalysisBtnVisibility();
    },

    _setAnalysisBtnVisibility: function() {
      this.view.toggleBtn(!!!this.status.get('baselayer'));
    },

    toggleVisibilityAnalysis: function(to){
      mps.publish('Analysis/visibility', [to]);
    },

    /**
     * Publish a 'Map/fit-bounds' with the bounds
     * from the suplied geojson.
     *
     * @param  {Object} geojson
     */
    _geojsonFitBounds: function(geojson) {
      var bounds = geojsonUtilsHelper.getBoundsFromGeojson(geojson);
      if (bounds) {
        mps.publish('Map/fit-bounds', [bounds]);
      }
    },

    /**
     * Publish a start drawing mps event.
     */
    startDrawing: function() {
      mps.publish('AnalysisTool/start-drawing', []);
    },

    /**
     * Publish a stop drawing mps event.
     */
    stopDrawing: function() {
      mps.publish('AnalysisTool/stop-drawing', []);
    },

    /**
     * Triggered when user finish drawing a polygon.
     * @param  {Object} e Event
     */
    onOverlayComplete: function(e) {
      e.overlay.type = e.type;
      e.overlay.setEditable(true);
      this.setOverlay(e.overlay);
    },

    setOverlay: function(overlay) {
      this.status.set('overlay', overlay);
    },

    setMultipolygon: function(multipolygon, geojson) {
      this.deleteMultiPoligon();
      this.status.set('multipolygon', multipolygon);
      mps.publish('AnalysisTool/iso-drawn', [geojson.geometry]);
    },

    deleteMultiPoligon: function(){
      this.view.deleteGeom({
        overlay: this.status.get('overlay'),
        multipolygon: this.status.get('multipolygon')
      });
    },

    /**
     * Used by PlaceService to get the current iso/geom params.
     *
     * @return {object} iso/geom params
     */
    getPlaceParams: function() {
      var resource = this.status.get('resource');
      if (!resource) {return;}
      var p = {};

      if (resource.iso) {
        p.iso = {};
        p.iso.country = resource.iso;
        p.iso.region = resource.id1 ? resource.id1 : null;
      } else if (resource.geostore) {
        p.geostore = resource.geostore;
      } else if (resource.geojson) {
        p.geojson = encodeURIComponent(resource.geojson);
      } else if (resource.wdpaid) {
        p.wdpaid = resource.wdpaid;
      }

      return p;
    },

    toggleOverlay: function(to){
      mps.publish('Overlay/toggle', [to])
    },

    notificate: function(id){
      mps.publish('Notification/open', [id]);
    },


  });

  return AnalysisToolPresenter;

});
