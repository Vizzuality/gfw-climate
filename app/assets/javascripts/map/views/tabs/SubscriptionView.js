/**
 * The SubscriptionView selector view.
 *
 * @return SubscriptionView instance (extends Backbone.View).
 */
define(
  [
    'underscore',
    'handlebars',
    'amplify',
    'chosen',
    'services/CountryService',
    'map/presenters/tabs/SubscriptionPresenter',
    'map/views/GeoStylingView',
    'text!map/templates/tabs/subscription.handlebars'
  ],
  function(
    _,
    Handlebars,
    amplify,
    chosen,
    CountryService,
    Presenter,
    GeoStylingView,
    tpl
  ) {
    'use strict';

    var SubscriptionModel = Backbone.Model.extend({
      hidden: true
    });

    var SubscriptionView = Backbone.View.extend({
      el: '#subscription-tab',

      template: Handlebars.compile(tpl),

      events: {
        //tabs
        'click #subscription-nav li': 'toggleTabs',

        //default
        'click #get-started-subscription': '_onClickStart',

        //draw
        'click #start-subscription': '_onClickSubscription',
        'click #done-subscription': '_onClickDone',

        //countries
        'change #subscription-country-select': 'changeIso',
        'change #subscription-region-select': 'changeArea',
        'click #subscription-country-button': 'subscriptionCountry',

        //other
        'click #data-tab-play-s': 'onGifPlay'
      },

      initialize: function(map) {
        _.bindAll(this, '_onOverlayComplete');
        this.map = map;
        this.presenter = new Presenter(this);
        this.model = new SubscriptionModel();
        this.geoStyles = new GeoStylingView();
        this.render();
        this.setListeners();
      },

      cacheVars: function() {
        this.$button = $('#' + this.$el.attr('id') + '-button');
        //deafult
        this.$defaultSubscription = $('#default-subscription');

        //draw
        this.$start = $('#start-subscription');
        this.$done = $('#done-subscription');

        //country
        this.$selects = this.$el.find('.chosen-select');
        this.$countrySelect = $('#subscription-country-select');
        this.$regionSelect = $('#subscription-region-select');
        this.$countryButton = $('#subscription-country-button');

        //other
        this.$img = $('#data-tab-img-s');
        this.$play = $('#data-tab-play-s');

        //tabs
        this.$tabs = $('#subscription-nav li');
        this.$tabsContent = $('.subscription-tab-content');

        //delete
        this.timeout = null;
      },

      setListeners: function() {},

      render: function() {
        this.$el.html(this.template());
        this.cacheVars();
        this.inits();
      },

      inits: function() {
        // countries
        this.setStyle();
        this.getCountries();

        //other
        this.png = '/assets/map/infowindow-example.png';
        this.gif = this.loadImg('/assets/map/infowindow-example2.gif');
      },

      // navigate between tabs
      toggleTabs: function(e) {
        if (!$(e.currentTarget).hasClass('disabled')) {
          var tab = $(e.currentTarget).data('subscription');

          // Current tab
          this.$tabs.removeClass('active');
          $(e.currentTarget).addClass('active');

          // Current content tab
          this.$tabsContent.removeClass('active');
          $('#' + tab).addClass('active');

          // prevent changes between tabs without reset drawing
          if (this.model.get('is_drawing')) {
            this._stopDrawing();
            this.presenter.deleteSubscription();
          }
        } else {
          this.$deletebtn = $('#analysis-delete');
          clearTimeout(this.timeout);
          this.$deletebtn.addClass('pulse');
          this.presenter.notificate('not-delete-analysis');
          this.timeout = setTimeout(
            _.bind(function() {
              this.$deletebtn.removeClass('pulse');
            }, this),
            3000
          );
        }
      },

      openTab: function(type) {
        var current;
        switch (type) {
          case 'geojson':
            current = '#draw-tab-button';
            $('#draw-tab-button')
              .removeClass('disabled')
              .trigger('click');
            break;
          case 'iso':
            current = '#country-tab-button';
            $('#country-tab-button')
              .removeClass('disabled')
              .trigger('click');
            break;
          case 'other':
            current = '#data-tab-button';
            $('#data-tab-button')
              .removeClass('disabled')
              .trigger('click');
            break;
        }
        this.fixTab(current);
      },

      fixTab: function(current) {
        // function to fix current tab and prevent user for changing tab with an analysis rendered
        this.$tabs.addClass('disabled');
        $(current).removeClass('disabled');
      },

      /**
       * Set geojson style.
       */
      setStyle: function() {
        this.style = this.geoStyles.getStyles('country');
      },

      setGeojson: function(geojson, color) {
        geojson.properties.color = color;
        return geojson;
      },

      /**
       * COUNTRY
       */

      /**
       * Ajax for getting countries.
       */
      getCountries: function() {
        if (!amplify.store('countries')) {
          var sql = [
            'SELECT c.iso, c.name FROM gfw2_countries c WHERE c.enabled = true'
          ];
          $.ajax({
            url: 'https://wri-01.cartodb.com/api/v2/sql?q=' + sql,
            dataType: 'json',
            success: _.bind(function(data) {
              amplify.store('countries', data.rows);
              this.printCountries();
            }, this),
            error: function(error) {
              console.log(error);
            }
          });
        } else {
          this.printCountries();
        }
      },

      getSubCountries: function() {
        CountryService.getRegions(this.iso).then(function(data) {
          console.log(data, 'regions');
          this.printSubareas(data.rows);
        });
        // var sql = ["SELECT g28c.cartodb_id, g28c.iso, g28a1.id_1, g28a1.name_1 as name_1 FROM gadm28_countries as g28c, gadm28_adm1 as g28a1 where g28c.iso = '"+this.iso+"' AND g28a1.iso = '"+this.iso+"' order by id_1 asc"];
        // $.ajax({
        //   url: 'https://wri-01.cartodb.com/api/v2/sql?q='+sql,
        //   dataType: 'json',
        //   success: _.bind(function(data){
        //     console.log(data, 'preves');
        //     this.printSubareas(data.rows);
        //   }, this ),
        //   error: function(error){
        //     console.log(error);
        //   }
        // });
      },

      /**
       * Print countries.
       */
      printCountries: function() {
        //Country select
        this.countries = amplify.store('countries');

        //Loop for print options
        var options = '<option></option>';
        _.each(
          _.sortBy(this.countries, function(country) {
            return country.name;
          }),
          _.bind(function(country, i) {
            options +=
              '<option value="' +
              country.iso +
              '">' +
              country.name +
              '</option>';
          }, this)
        );
        this.$countrySelect.append(options);
        this.$selects.chosen({
          width: '100%',
          allow_single_deselect: true,
          inherit_select_classes: true,
          no_results_text: 'Oops, nothing found!'
        });
      },

      printSubareas: function(subareas) {
        var subareas = subareas;
        var options = '<option></option>';
        _.each(
          _.sortBy(subareas, function(area) {
            return area.name_1;
          }),
          _.bind(function(area, i) {
            options +=
              '<option value="' + area.id_1 + '">' + area.name_1 + '</option>';
          }, this)
        );
        this.$regionSelect
          .empty()
          .append(options)
          .removeAttr('disabled');
        this.$regionSelect.val(this.area).trigger('liszt:updated');
      },

      // Select change iso
      changeIso: function(e) {
        this.iso = $(e.currentTarget).val();
        this.$countryButton.removeClass('disabled');
        this.area = null;
        if (this.iso) {
          this.getSubCountries();
        } else {
          this.presenter.deleteSubscription();
          this.presenter.resetIsos();
          this.$regionSelect
            .val(null)
            .attr('disabled', true)
            .trigger('liszt:updated');
        }
      },
      changeArea: function(e) {
        this.area = $(e.currentTarget).val();
        this.$countryButton.removeClass('disabled');
      },

      // For autoselect country and region when youn reload page
      setSelects: function(iso, dont_analyze) {
        this.iso = iso.country;
        this.area = iso.region;

        this.$countrySelect.val(this.iso).trigger('liszt:updated');
        if (this.iso) {
          this.getSubCountries();
          if (!dont_analyze) {
            this.$countryButton.addClass('disabled');
          }
        } else {
          this.$countryButton.removeClass('disabled');
          this.$regionSelect
            .val(this.area)
            .attr('disabled', true)
            .trigger('liszt:updated');
        }
      },

      subscriptionCountry: function() {
        if (this.iso && !this.$countryButton.hasClass('disabled')) {
          var iso = {
            country: this.iso,
            region: this.area
          };
          this.$countryButton.addClass('disabled');
          this.presenter.setSubscriptionIso(iso);
        }
      },

      _onClickStart: function() {
        this.$defaultSubscription.hide(0);
      },

      /**
       * DRAWING
       */
      /**
       * Triggered when the user clicks on the analysis draw button.
       */
      _onClickSubscription: function() {
        if (!this.$start.hasClass('in_use')) {
          ga('send', 'event', 'Map', 'Analysis', 'Click: start');
          this.toggleUseBtn(true);
          this._startDrawingManager();
          this.presenter.startDrawing();
        } else {
          ga('send', 'event', 'Map', 'Analysis', 'Click: cancel');
          this._stopDrawing();
          this.presenter.deleteSubscription();
        }
      },

      /**
       * Triggered when the user clicks on done
       * to get the analysis of the new polygon.
       */
      _onClickDone: function() {
        if (!this.$done.hasClass('disabled')) {
          ga('send', 'event', 'Map', 'Analysis', 'Click: done');
          this._stopDrawing();
          this.presenter.doneDrawing();
        }
      },

      /**
       * Star drawing manager and add an overlaycomplete
       * listener.
       */
      _startDrawingManager: function() {
        this.presenter.deleteMultiPoligon();
        this.setSelects({ country: null, region: null });
        this.model.set('is_drawing', true);
        this.drawingManager = new google.maps.drawing.DrawingManager({
          drawingControl: false,
          drawingMode: google.maps.drawing.OverlayType.POLYGON,
          polygonOptions: _.extend(
            {
              editable: true
            },
            this.style
          ),
          panControl: false,
          map: this.map
        });
        // cache cartodb infowindows
        this.$infowindows = $('.cartodb-infowindow');
        this.$infowindows.addClass('hidden');

        google.maps.event.addListener(
          this.drawingManager,
          'overlaycomplete',
          this._onOverlayComplete
        );
      },

      /**
       * Triggered when the user finished drawing a polygon.
       *
       * @param  {Object} e event
       */
      _onOverlayComplete: function(e) {
        ga('send', 'event', 'Map', 'Analysis', 'Polygon: complete');
        this.presenter.onOverlayComplete(e);
        this._resetDrawing();
        // buttons clases
        this.toggleDoneBtn(false);
      },

      /**
       * Stop drawing manager, set drawing box to hidden.
       */
      _stopDrawing: function() {
        this.presenter.stopDrawing();
        this._resetDrawing();
        // buttons clases
        this.toggleUseBtn(false);
        this.toggleDoneBtn(true);
      },

      _resetDrawing: function() {
        this.model.set('is_drawing', false);
        if (this.$infowindows) this.$infowindows.hide(0).removeClass('hidden');
        if (this.drawingManager) {
          this.drawingManager.setDrawingMode(null);
          this.drawingManager.setMap(null);
        }
      },

      /**
       * Deletes a overlay from the map.
       *
       * @param  {object} resource overlay/multipolygon
       */
      deleteGeom: function(resource) {
        if (resource.overlay) {
          resource.overlay.setMap(null);
          resource.overlay = null;
        }

        if (resource.multipolygon) {
          this.map.data.remove(resource.multipolygon);
        }

        this.$tabs.removeClass('disabled');
      },

      setEditable: function(overlay, to) {
        overlay.setEditable(to);
      },

      /**
       * Draw Geojson polygon on the map.
       *
       * @param  {String} geojson Geojson polygon as a string
       */
      drawPaths: function(paths) {
        var overlay = new google.maps.Polygon(
          _.extend({}, { paths: paths }, this.style)
        );

        overlay.setMap(this.map);
        this.presenter.setOverlay(overlay);
      },

      /**
       * Draw a multypoligon on the map.
       *
       * @param  {Object} topojson
       */
      drawMultipolygon: function(geojson) {
        var multipolygon = this.map.data.addGeoJson(geojson)[0];
        this.presenter.setMultipolygon(multipolygon, geojson);
      },
      drawCountrypolygon: function(geojson, color) {
        var geojson = this.setGeojson(geojson, color);
        this.setStyle();
        var multipolygon = this.map.data.addGeoJson(geojson)[0];
        this.presenter.setMultipolygon(multipolygon, geojson);
      },

      /**
       * BUTTONS.
       */
      toggleBtn: function(to) {
        if (to) {
          this.$button.hasClass('active')
            ? this.$button.trigger('click')
            : null;
          this.$button.removeClass('in_use').addClass('disabled');
        } else {
          this.$button.removeClass('disabled');
        }
        $('.cartodb-popup').toggleClass('dont_analyze', to);
      },

      toggleUseBtn: function(to) {
        this.$start.toggleClass('in_use', to);
        to
          ? this.$start
              .removeClass('blue')
              .addClass('gray')
              .text('Cancel')
          : this.$start
              .removeClass('gray')
              .addClass('blue')
              .text('Start drawing');
        $('.cartodb-popup').toggleClass('dont_analyze', to);
      },

      toggleDoneBtn: function(to) {
        $('#draw-analysis').toggleClass('one', to);
        this.$done.parent().toggleClass('hidden', to);
      },

      // OTHER
      onGifPlay: function() {
        this.$play.addClass('hidden');
        this.$img.attr('src', this.gif);
        setTimeout(
          _.bind(function() {
            this.$play.removeClass('hidden');
            this.$img.attr('src', this.png);
          }, this),
          7500
        );
      },

      loadImg: function(url) {
        var img = new Image();
        img.src = url;
        return url;
      }
    });
    return SubscriptionView;
  }
);
