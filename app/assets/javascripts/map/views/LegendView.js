/**
 * Legend module.
 *
 * @return singleton instance of the legend class (extends Widget).
 */
define(
  [
    'underscore',
    'handlebars',
    'map/presenters/LegendPresenter',
    'text!map/templates/legend/legend.handlebars',
    'text!map/templates/legend/biomass_loss.handlebars',
    'text!map/templates/legend/biomass.handlebars',
    'text!map/templates/legend/idnPrimary.handlebars',
    'text!map/templates/legend/intact2013.handlebars',
    'text!map/templates/legend/grump.handlebars',
    'text!map/templates/legend/stories.handlebars',
    'text!map/templates/legend/concesiones_forestales.handlebars',
    'text!map/templates/legend/concesiones_forestalesType.handlebars',
    'text!map/templates/legend/hondurasForest.handlebars',
    'text!map/templates/legend/colombiaForestChange.handlebars',
    'text!map/templates/legend/dam_hotspots.handlebars',
    'text!map/templates/legend/us_land_cover.handlebars',
    'text!map/templates/legend/bra_biomes.handlebars',
    'text!map/templates/legend/idn_peat.handlebars',
    'text!map/templates/legend/total_carbon.handlebars',
    'text!map/templates/legend/biomass_carbon.handlebars',
    'text!map/templates/legend/hsdw.handlebars',
    'text!map/templates/legend/plantations_by_type.handlebars',
    'text!map/templates/legend/plantations_by_species.handlebars',
    'text!map/templates/legend/peatland_drainage.handlebars',
    'text!map/templates/legend/colombiaForestChange.handlebars',
    'text!map/templates/legend/us_land_cover.handlebars',
    'text!map/templates/legend/bra_biomes.handlebars',
    'text!map/templates/legend/gtm_forest_change.handlebars',
    'text!map/templates/legend/gtm_forest_cover.handlebars',
    'text!map/templates/legend/gtm_forest_density.handlebars',
    'text!map/templates/legend/khm_eco_land_conc.handlebars',
    'text!map/templates/legend/usa_forest_ownership.handlebars',
    'text!map/templates/legend/mysPA.handlebars',
    'text!map/templates/legend/per_mining.handlebars',
    'text!map/templates/legend/raisg_mining.handlebars',
    'text!map/templates/legend/mangrove_biomass.handlebars',
    'text!map/templates/legend/carbon_gain.handlebars'
  ],
  function(
    _,
    Handlebars,
    Presenter,
    tpl,
    biomass_lossTpl,
    biomassTpl,
    idnPrimaryTpl,
    intact2013Tpl,
    grumpTpl,
    storiesTpl,
    concesionesTpl,
    concesionesTypeTpl,
    hondurasForestTPL,
    colombiaForestChangeTPL,
    dam_hotspotsTPL,
    us_land_coverTPL,
    bra_biomesTPL,
    idn_peatTPL,
    total_carbon,
    biomass_carbonTPL,
    hsdwTPL,
    gfwPlantationByTypeTpl,
    gfwPlantationBySpeciesTpl,
    peatland_drainageTpl,
    colombiaForestChangeTpl,
    us_land_coverTpl,
    bra_biomesTpl,
    gtm_forest_changeTpl,
    gtm_forest_coverTpl,
    gtm_forest_densityTpl,
    khm_eco_land_concTpl,
    usa_forest_ownershipTpl,
    mysPATpl,
    per_miningTpl,
    raisg_miningTpl,
    mangrove_biomassTpl,
    carbon_gainTpl
  ) {
    'use strict';

    var carbonGainConfig = {
      ranges: {
        tco: {
          min: 0,
          max: 440
        }
      },
      units: [
        {
          name: 't CO2 ha<sup>-1</sup>',
          value: 'tco'
        }
      ],
      selectedUnit: 'tco'
    };

    var LegendModel = Backbone.Model.extend({
      defaults: {
        hidden: true,
        categories_status: []
      }
    });

    var LegendView = Backbone.View.extend({
      el: '#module-legend',

      template: Handlebars.compile(tpl),

      defaults: {
        layersConfig: {
          biomass_loss: {
            ranges: {
              tco: {
                min: 0,
                max: 917
              }
            },
            units: [
              {
                name: 't CO2 ha<sup>-1</sup>',
                value: 'tco'
              }
            ],
            selectedUnit: 'tco'
          },
          // Carbon Gain
          total_sg: carbonGainConfig,
          total_2028: carbonGainConfig,
          ysg_msg: carbonGainConfig,
          pastures: carbonGainConfig,
          crops_1: carbonGainConfig,

          carbon_stocks: {
            ranges: {
              biomass: {
                min: 0,
                max: 500
              },
              carbon: {
                min: 0,
                max: 250
              }
            },
            units: [
              {
                name: 'Mg biomass ha<sup>-1</sup>',
                value: 'biomass'
              },
              {
                name: 'Mg C ha<sup>-1</sup>',
                value: 'carbon'
              }
            ],
            selectedUnit: 'carbon'
          }
        }
      },

      options: {
        hidden: true
      },

      events: {
        'click .category-name': '_toogleCategory',
        'click .layer-sublayer': '_toggleLayer',
        'click .canopy-button': '_showCanopy',
        'click .layer-close': '_removeLayer',
        'click .close': 'toogleLegend',
        'click #title-dialog-legend': 'toogleEmbedLegend',
        'click .toggle-title': 'toggleLegendOptions',
        'change input': 'updateRange',
        'click .js-units-selector': '_changeUnit'
      },

      /**
       * Optional layers detail templates.
       */
      detailsTemplates: {
        biomass_loss: Handlebars.compile(biomass_lossTpl),
        carbon_stocks: Handlebars.compile(biomassTpl),
        idn_primary: Handlebars.compile(idnPrimaryTpl),
        ifl_2013_deg: Handlebars.compile(intact2013Tpl),
        grump2000: Handlebars.compile(grumpTpl),
        user_stories: Handlebars.compile(storiesTpl),
        concesiones_forestales: Handlebars.compile(concesionesTpl),
        concesiones_forestalesNS: Handlebars.compile(concesionesTypeTpl),
        WMSLayer: Handlebars.compile(hondurasForestTPL),
        dam_hotspots: Handlebars.compile(dam_hotspotsTPL),
        idn_peat_lands: Handlebars.compile(idn_peatTPL),
        total_carbon: Handlebars.compile(total_carbon),
        biomass_carbon: Handlebars.compile(biomass_carbonTPL),
        hwsd: Handlebars.compile(hsdwTPL),
        plantations_by_type: Handlebars.compile(gfwPlantationByTypeTpl),
        plantations_by_species: Handlebars.compile(gfwPlantationBySpeciesTpl),
        peatland_drainage: Handlebars.compile(peatland_drainageTpl),
        idn_peatland_drainage: Handlebars.compile(peatland_drainageTpl),
        colombia_forest_change: Handlebars.compile(colombiaForestChangeTPL),
        us_land_cover: Handlebars.compile(us_land_coverTPL),
        us_land_cover_change: Handlebars.compile(us_land_coverTPL),
        bra_biomes: Handlebars.compile(bra_biomesTPL),
        bra_plantations_type: Handlebars.compile(gfwPlantationByTypeTpl),
        per_plantations_type: Handlebars.compile(gfwPlantationByTypeTpl),
        lbr_plantations_type: Handlebars.compile(gfwPlantationByTypeTpl),
        col_plantations_type: Handlebars.compile(gfwPlantationByTypeTpl),
        khm_plantations_type: Handlebars.compile(gfwPlantationByTypeTpl),
        idn_plantations_type: Handlebars.compile(gfwPlantationByTypeTpl),
        mys_plantations_type: Handlebars.compile(gfwPlantationByTypeTpl),
        bra_plantations_species: Handlebars.compile(gfwPlantationBySpeciesTpl),
        per_plantations_species: Handlebars.compile(gfwPlantationBySpeciesTpl),
        lbr_plantations_species: Handlebars.compile(gfwPlantationBySpeciesTpl),
        col_plantations_species: Handlebars.compile(gfwPlantationBySpeciesTpl),
        khm_plantations_species: Handlebars.compile(gfwPlantationBySpeciesTpl),
        idn_plantations_species: Handlebars.compile(gfwPlantationBySpeciesTpl),
        mys_plantations_species: Handlebars.compile(gfwPlantationBySpeciesTpl),
        gtm_forest_change1: Handlebars.compile(gtm_forest_changeTpl),
        gtm_forest_change2: Handlebars.compile(gtm_forest_changeTpl),
        gtm_forest_cover: Handlebars.compile(gtm_forest_coverTpl),
        gtm_forest_density: Handlebars.compile(gtm_forest_densityTpl),
        khm_eco_land_conc: Handlebars.compile(khm_eco_land_concTpl),
        usa_forest_ownership: Handlebars.compile(usa_forest_ownershipTpl),
        mys_protected_areas: Handlebars.compile(mysPATpl),
        bra_mining: Handlebars.compile(raisg_miningTpl),
        per_mining: Handlebars.compile(per_miningTpl),
        global_mangroves_biomass: Handlebars.compile(mangrove_biomassTpl),
        total_sg: Handlebars.compile(carbon_gainTpl),
        total_2028: Handlebars.compile(carbon_gainTpl),
        ysg_msg: Handlebars.compile(carbon_gainTpl),
        pastures: Handlebars.compile(carbon_gainTpl),
        crops_1: Handlebars.compile(carbon_gainTpl)
      },

      initialize: function() {
        _.bindAll(this, 'update');
        this.presenter = new Presenter(this);
        this.model = new LegendModel();
        this.embed = $('body').hasClass('is-embed-action');
        this.layersConfig = this.defaults.layersConfig;
        this.$el.removeClass('hide');
        this.setListeners();
      },

      setListeners: function() {
        this.model.on('change:hidden', this.toogleModule, this);
      },

      toogleModule: function() {
        this.$el.toggleClass('hide', this.model.get('hidden'));
      },

      toogleEmbedLegend: function(e) {
        e && e.preventDefault();
        var active = this.$titleDialog.hasClass('active');
        this.$titleDialog.toggleClass('active', !active);
        this.$categories.toggleClass('active', !active);
        this.$buttonLegendBox.toggleClass('active', !active);
      },

      openGFW: function() {
        if (this.embed && !!this.$linkLegendBox) {
          var href = window.location.href.replace('/embed', '');
          this.$linkLegendBox.attr('href', href);
        }
      },

      /**
       *
       * @param  {array}  categories layers ordered by category
       * @param  {object} options    legend options
       */
      _renderLegend: function(categories, options, geographic) {
        var iso = null;
        var layersGlobal = [];
        var layersIso = [];
        var categoriesGlobal = [];
        var categoriesIso = [];
        var layers = _.flatten(categories);
        var layersLength = layers.length;

        // Append details template to layer.
        _.each(
          layers,
          function(layer) {
            layer.source = layer.slug === 'nothing' ? null : layer.slug;
            if (this.layersConfig[layer.slug]) {
              var layerData = this._getLayerData(layer, options);

              layer.detailsTpl = this.detailsTemplates[layer.slug]({
                threshold: options.threshold || 30,
                layerTitle: layer.title,
                minvalue: layerData.min,
                maxvalue: layerData.max,
                units: layerData.units,
                unit: layerData.unit
              });
            } else if (this.detailsTemplates[layer.slug]) {
              layer.detailsTpl = this.detailsTemplates[layer.slug]({
                threshold: options.threshold || 30,
                layerTitle: layer.title
              });
            }
            if (layer.iso) {
              var countries = amplify.store('countries');
              iso = layer.iso;
              layersIso.push(layer);
              layer.category_status = layer.category_slug + '-iso';
            } else {
              layersGlobal.push(layer);
              layer.category_status = layer.category_slug + '-global';
            }
            layer.geographic = geographic ? 'checked' : '';
          },
          this
        );

        categoriesGlobal = this.statusCategories(
          _.groupBy(layersGlobal, function(layer) {
            return layer.category_slug;
          })
        );
        categoriesIso = this.statusCategories(
          _.groupBy(layersIso, function(layer) {
            return layer.category_slug;
          })
        );

        if (iso) {
          var country = _.find(
            amplify.store('countries'),
            _.bind(function(country) {
              return country.iso === iso;
            }, this)
          );
        }
        var name = country ? country.name : iso;

        var html = this.template({
          categories: jQuery.isEmptyObject(categoriesGlobal)
            ? false
            : categoriesGlobal,
          categoriesIso: categoriesIso,
          layersLength: layersLength,
          iso: iso,
          name: name
        });

        this.render(html);
      },

      statusCategories: function(array) {
        // Search for layer 'nothing'
        var categories_status = this.model.get('categories_status');
        _.each(
          array,
          function(category) {
            for (var i = 0; i < category.length; i++) {
              // Mantain categories closed in rendering
              categories_status.indexOf(category[i]['category_status']) != -1
                ? (category['closed'] = true)
                : (category['closed'] = false);
              // Get layer's length of each category
              category['layers_length'] = i + 1;
            }
          },
          this
        );

        return array;
      },

      toogleLegend: function(bool) {
        var to = bool && bool.currentTarget ? false : bool;
        this.$el.toggleClass('active', to);
        this.presenter.toggleOverlay(to);
      },

      /**
       * Toggle selected sublayers on the legend widget.
       *
       * @param  {object} layers The layers object
       */
      toggleSelected: function(layers) {
        _.each(
          this.$el.find('.layer-sublayer'),
          function(div) {
            var $div = $(div);
            var $toggle = $div.find('.onoffswitch');
            var layer = layers[$div.data('sublayer')];

            if (layer) {
              $toggle.addClass('checked');
              $toggle.css('background', layer.category_color);
            } else {
              $toggle.removeClass('checked').css('background', '');
            }
          },
          this
        );
      },

      render: function(html) {
        this.$el.html(html);
        this.$titleDialog = $('#title-dialog-legend');
        this.$categories = this.$el.find('.categories');
        this.$buttonLegendBox = $('#button-box-embed-legend');
        this.$linkLegendBox = $('#link-embed-legend');
      },

      /**
       * Set widget from layers object.
       *
       * @param  {array} layers
       */
      update: function(categories, options, geographic) {
        if (categories.length === 0) {
          this.model.set('hidden', true);
        } else {
          this.model.set({ hidden: false, boxClosed: false });
          this._renderLegend(categories, options, geographic);
        }
        //Experiment
        this.presenter.initExperiment('source');
      },

      /**
       * Handles a toggle layer change UI event by dispatching
       * to LegendPresenter.
       *
       * @param  {event} event Click event
       */
      _toggleLayer: function(event) {
        var layerSlug = $(event.currentTarget).data('sublayer');
        this.presenter.toggleLayer(layerSlug);
      },

      _toogleCategory: function(e) {
        if ($(window).width() > window.gfw.config.GFW_MOBILE) {
          // Save category status in an array
          var categories_status = this.model.get('categories_status');
          var slug = $(e.currentTarget).data('category_slug');
          var index = categories_status.indexOf(slug);
          index != -1
            ? categories_status.splice(index, 1)
            : categories_status.push(slug);
          this.model.set('categories_status', categories_status);

          $(e.currentTarget)
            .parent()
            .toggleClass('closed');
          $(e.currentTarget)
            .parent()
            .children('.layers')
            .toggleClass('closed');
        }
      },

      _removeLayer: function(e) {
        e && e.preventDefault();
        var layerSlug = $(e.currentTarget).data('slug');
        this.presenter.toggleLayer(layerSlug);
      },

      _showCanopy: function(e) {
        if (!!e.target.parentNode.classList.contains('minavgmax'))
          return this._getUncertainty(e);
        if (!!e.target.parentNode.classList.contains('range')) return;
        e && e.preventDefault();
        this.presenter.showCanopy();
      },

      _getUncertainty: function(e) {
        this.presenter.changeUncertainty(e.target.dataset);
      },

      _setUncertaintyOptionUI: function(type) {
        var $opt = this.$el.find('[data-quantity="' + type + '"]');
        $opt
          .addClass('current')
          .siblings('.current')
          .removeClass('current');
      },

      _getLayerData: function(layer, opts) {
        var unitsList = [];
        var selectedUnit =
          !!opts.rangearray && opts.rangearray[layer.slug]
            ? opts.rangearray[layer.slug].unit
            : this.layersConfig[layer.slug].selectedUnit;
        var defaultRange = this.layersConfig[layer.slug].ranges[selectedUnit];
        var units = this.layersConfig[layer.slug].units;
        var currentUnit = _.findWhere(units, { value: selectedUnit });
        var values = {};

        values.min =
          !!opts.rangearray && opts.rangearray[layer.slug]
            ? opts.rangearray[layer.slug].minrange
            : false || (!!defaultRange ? defaultRange.min : null);

        values.max =
          !!opts.rangearray && opts.rangearray[layer.slug]
            ? opts.rangearray[layer.slug].maxrange
            : false || (!!defaultRange ? defaultRange.max : null);

        var unit =
          !!opts.rangearray && opts.rangearray[layer.slug]
            ? opts.rangearray[layer.slug].unit
            : false || (!!currentUnit ? currentUnit.value : null);

        var units =
          this.layersConfig[layer.slug] && this.layersConfig[layer.slug].units
            ? this.layersConfig[layer.slug].units
            : null;

        this.layersConfig[layer.slug].selectedUnit = selectedUnit;

        if (opts && opts.rangearray) {
          values = this._formatValues(layer.slug, values, selectedUnit);
        }

        if (units) {
          _.map(units, function(unit) {
            unit.selected = unit.value === selectedUnit;
          });
        }

        return {
          min: values.min,
          max: values.max,
          unit: currentUnit.name,
          units: units
        };
      },

      toggleLegendOptions: function(e) {
        if (e.target.tagName === 'SPAN') e = e.target.parentNode;
        else e = e.target;
        $(e)
          .find('span')
          .toggleClass('active');
        $(e)
          .siblings('.toggle-legend-option')
          .toggle('250');
      },

      /**
       * Updates the range when the user changes the values
       *
       * @param  {object} event
       */
      updateRange: function(ev) {
        var parent = $(ev.target).parents('.layer-details');
        var slug = parent.data('layer-group');
        var values = this._getCurrentRangeFromLayer(slug);

        this._setRangeLabels(slug, values);
        this._updateRangeBar(slug, values);
        this._updateLayerRange(slug);
      },

      /**
       * Returns the current values and validates the limits
       *
       * @param  {String} layer id name
       * @return {Object} values and unit
       */
      _getCurrentRangeFromLayer: function(slug) {
        var parent = this.el.querySelector('[data-layer-group="' + slug + '"]');
        var $minEl = parent.querySelector('.js-min');
        var $maxEl = parent.querySelector('.js-max');
        var $unitEl = parent.querySelector('.js-unit');
        var min = $minEl.value * 1;
        var max = $maxEl.value * 1;
        var unit = $unitEl.value;
        var selectedUnit = this.layersConfig[slug].selectedUnit;
        var layerRange = this.layersConfig[slug].ranges[selectedUnit];
        var units = this.layersConfig[slug].units;
        var currentUnit = _.findWhere(units, { value: selectedUnit });

        if (min < 0 || min > layerRange.max) {
          min = layerRange.min;
          $minEl.value = layerRange.min;
        }

        if (max < 0 || max > layerRange.max || max < min) {
          max = layerRange.max;
          $maxEl.value = layerRange.max;
        }

        return {
          min: min,
          max: max,
          unit: unit ? unit : currentUnit.value
        };
      },

      /**
       * Sets the new values in the labels
       *
       * @param  {String} layer id name
       * @param  {Object} min and max values
       */
      _setRangeLabels: function(slug, values) {
        var $parent = this.el.querySelector(
          '[data-layer-group="' + slug + '"]'
        );
        var $minLabel = $parent.querySelector('.js-min-label');
        var $maxLabel = $parent.querySelector('.js-max-label');
        var $unitLabel = $parent.querySelector('.js-unit');
        var $selectorLabel = $parent.querySelector('.js-units-selector');
        var units = this.layersConfig[slug].units;
        var unitName = _.findWhere(units, { value: values.unit });

        $minLabel.innerHTML = values.min;
        $maxLabel.innerHTML = values.max;

        if (unitName) {
          $($unitLabel).html(unitName.name);

          if ($selectorLabel) {
            $($selectorLabel).html(unitName.name);
          }
        }
      },

      /**
       * Updates the range bar handles
       *
       * @param  {String} layer id name
       * @param  {Object} min and max values
       */
      _updateRangeBar: function(slug, range) {
        var parent = this.el.querySelector('[data-layer-group="' + slug + '"]');
        var rangeBars = parent.querySelectorAll('.range-bar');
        var layerRange = this.layersConfig[slug].ranges[range.unit];

        if (range.min == layerRange.min && range.max == layerRange.max) {
          rangeBars[0].classList.remove('-visible');
          rangeBars[1].classList.remove('-visible');
        }

        rangeBars[0].style.left = range.min * 100 / layerRange.max + '%';
        rangeBars[0].classList.add('-visible');
        rangeBars[1].style.left = range.max * 100 / layerRange.max + '%';
        rangeBars[1].classList.add('-visible');
      },

      /**
       * Extra values formatting for some layers
       *
       * @param  {String} layer id name
       * @param  {Object} min and max values
       * @param  {String} unit
       * @param  {Boolean} store in the url
       */
      _formatValues: function(slug, values, unit, toStore) {
        if (slug === 'carbon_stocks') {
          if (unit === 'carbon') {
            if (toStore) {
              values.min = values.min * 2;
              values.max = values.max * 2;
            } else {
              values.min = values.min / 2;
              values.max = values.max / 2;
            }
          }
        }
        return values;
      },

      /**
       * When the user changes the unit it updates
       * the values and range
       *
       * @param  {Object} event
       */
      _changeUnit: function(ev) {
        var slug = ev.currentTarget.dataset.layer;
        var $parent = this.el.querySelector(
          '[data-layer-group="' + slug + '"]'
        );
        var $unitsList = $parent.querySelector('.js-units-list');
        var $options = $unitsList.querySelectorAll('.js-item');
        var current = $unitsList.value;
        var selectedUnit = this.layersConfig[slug].selectedUnit;
        var value;

        for (var x = 0; x < $options.length; x++) {
          var item = $options[x];
          if (item.value !== current) {
            $unitsList.value = item.value;
            value = item.value;
          }
        }

        // Special case for this layer
        if (slug === 'carbon_stocks') {
          this._setInputsValues(slug, selectedUnit);
        }

        this.layersConfig[slug].selectedUnit = value;

        var currentParams = this._getCurrentRangeFromLayer(slug);
        this._setRangeLabels(slug, currentParams);
        this._updateLayerRange(slug);
      },

      /**
       * Updates the inputs with the new values
       * some formatting might be done for some layers
       *
       * @param  {String} layer id name
       * @param  {String} unit
       */
      _setInputsValues: function(slug, selectedUnit) {
        var parent = this.el.querySelector('[data-layer-group="' + slug + '"]');
        var $minEl = parent.querySelector('.js-min');
        var $maxEl = parent.querySelector('.js-max');
        var min = $minEl.value;
        var max = $maxEl.value;

        // Special case for this layer
        if (slug === 'carbon_stocks') {
          if (selectedUnit === 'biomass') {
            min = min / 2;
            max = max / 2;
          } else if (selectedUnit === 'carbon') {
            min = min * 2;
            max = max * 2;
          }
        }

        $minEl.value = min;
        $maxEl.value = max;
      },

      /**
       * Creates a new range array
       * with the selected data
       *
       * @param  {String} layer id name
       * @param  {Object} range values
       * @return  {Object} new range
       */
      _createRangeArray: function(slug, range) {
        var layerRange = this.layersConfig[slug].ranges[range.unit];
        var rangeArray = {};

        rangeArray[slug] = {
          minrange: range.min,
          maxrange: range.max,
          TOTALMIN: layerRange.min,
          TOTALMAX: layerRange.max,
          unit: range.unit
        };
        return rangeArray;
      },

      /**
       * Updates the new data in the url
       * with the selected data and also
       * updates the layer
       *
       * @param  {String} layer id name
       */
      _updateLayerRange: function(slug) {
        var values = this._getCurrentRangeFromLayer(slug);
        values = this._formatValues(slug, values, values.unit, true);
        var rangeArray = this._createRangeArray(slug, values);

        this.presenter._updateRangeArray(rangeArray, slug);
        this.presenter.setNewRange([values.min, values.max], slug);
      }
    });

    return LegendView;
  }
);
