/**
 * Legend module.
 *
 * @return singleton instance of the legend class (extends Widget).
 */
define([
  'underscore',
  'handlebars',
  'map/presenters/LegendPresenter',
  'text!map/templates/legend/legend.handlebars',
  'text!map/templates/legend/biomass_loss.handlebars',
  'text!map/templates/legend/biomass.handlebars',
  'text!map/templates/legend/imazon.handlebars',
  'text!map/templates/legend/fires.handlebars',
  'text!map/templates/legend/forest2000.handlebars',
  'text!map/templates/legend/pantropical.handlebars',
  'text!map/templates/legend/idnPrimary.handlebars',
  'text!map/templates/legend/intact2013.handlebars',
  'text!map/templates/legend/grump.handlebars',
  'text!map/templates/legend/stories.handlebars',
  'text!map/templates/legend/terra_i.handlebars',
  'text!map/templates/legend/concesiones_forestales.handlebars',
  'text!map/templates/legend/concesiones_forestalesType.handlebars',
  'text!map/templates/legend/hondurasForest.handlebars',
  'text!map/templates/legend/colombiaForestChange.handlebars',
  'text!map/templates/legend/tigers.handlebars',
  'text!map/templates/legend/dam_hotspots.handlebars',
  'text!map/templates/legend/us_land_cover.handlebars',
  'text!map/templates/legend/global_land_cover.handlebars',
  'text!map/templates/legend/forma.handlebars',
  'text!map/templates/legend/bra_biomes.handlebars',
  'text!map/templates/legend/idn_peat.handlebars',
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

], function(_, Handlebars, Presenter, tpl, biomass_lossTpl, biomassTpl, imazonTpl, firesTpl,
    forest2000Tpl, pantropicalTpl, idnPrimaryTpl, intact2013Tpl, grumpTpl, storiesTpl, terra_iTpl, concesionesTpl, concesionesTypeTpl, hondurasForestTPL,colombiaForestChangeTPL, tigersTPL, dam_hotspotsTPL, us_land_coverTPL, global_land_coverTPL, formaTPL,bra_biomesTPL, idn_peatTPL,hsdwTPL, gfwPlantationByTypeTpl, gfwPlantationBySpeciesTpl,peatland_drainageTpl,colombiaForestChangeTpl, us_land_coverTpl, bra_biomesTpl, gtm_forest_changeTpl, gtm_forest_coverTpl, gtm_forest_densityTpl, khm_eco_land_concTpl, usa_forest_ownershipTpl, mysPATpl, per_miningTpl,raisg_miningTpl) {

  'use strict';

  var LegendModel = Backbone.Model.extend({
    defaults:{
      hidden: true,
      categories_status: [],
    }
  });



  var LegendView = Backbone.View.extend({

    el: '#module-legend',

    template: Handlebars.compile(tpl),

    /**
     * Optional layers detail templates.
     */
    detailsTemplates: {
      biomass_loss: Handlebars.compile(biomass_lossTpl),
      carbon_stocks: Handlebars.compile(biomassTpl),
      imazon: Handlebars.compile(imazonTpl),
      fires: Handlebars.compile(firesTpl),
      forest2000: Handlebars.compile(forest2000Tpl),
      pantropical: Handlebars.compile(pantropicalTpl),
      idn_primary: Handlebars.compile(idnPrimaryTpl),
      ifl_2013_deg: Handlebars.compile(intact2013Tpl),
      grump2000: Handlebars.compile(grumpTpl),
      user_stories:  Handlebars.compile(storiesTpl),
      terrailoss: Handlebars.compile(terra_iTpl),
      concesiones_forestales: Handlebars.compile(concesionesTpl),
      concesiones_forestalesNS: Handlebars.compile(concesionesTypeTpl),
      WMSLayer: Handlebars.compile(hondurasForestTPL),
      colombia_forest_change: Handlebars.compile(colombiaForestChangeTPL),
      tigers: Handlebars.compile(tigersTPL),
      dam_hotspots: Handlebars.compile(dam_hotspotsTPL),
      us_land_cover: Handlebars.compile(us_land_coverTPL),
      global_land_cover : Handlebars.compile(global_land_coverTPL),
      us_land_cover_change : Handlebars.compile(us_land_coverTPL),
      forma : Handlebars.compile(formaTPL),
      bra_biomes : Handlebars.compile(bra_biomesTPL),
      idn_peat_lands : Handlebars.compile(idn_peatTPL),
      hwsd : Handlebars.compile(hsdwTPL),
      plantations_by_type: Handlebars.compile(gfwPlantationByTypeTpl),
      plantations_by_species: Handlebars.compile(gfwPlantationBySpeciesTpl),
      peatland_drainage: Handlebars.compile(peatland_drainageTpl),
      idn_peatland_drainage: Handlebars.compile(peatland_drainageTpl),
      colombia_forest_change: Handlebars.compile(colombiaForestChangeTPL),
      us_land_cover: Handlebars.compile(us_land_coverTPL),
      us_land_cover_change : Handlebars.compile(us_land_coverTPL),
      bra_biomes : Handlebars.compile(bra_biomesTPL),
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
      mys_protected_areas:Handlebars.compile(mysPATpl),
      bra_mining:Handlebars.compile(raisg_miningTpl),
      per_mining:Handlebars.compile(per_miningTpl),


    },

    options: {
      hidden: true
    },

    events: {
      'click .category-name' : '_toogleCategory',
      'click .layer-sublayer': '_toggleLayer',
      'click .canopy-button' : '_showCanopy',
      'click .layer-close'   : '_removeLayer',
      'click .close' : 'toogleLegend',
      'click #title-dialog-legend' : 'toogleEmbedLegend',
      'click .toggle-title' : 'toggleLegendOptions',
      'change input'        : 'updateRange'
    },

    initialize: function() {
      _.bindAll(this, 'update');
      this.presenter = new Presenter(this);
      this.model = new LegendModel();
      this.embed = $('body').hasClass('is-embed-action');
      this.$el.removeClass('hide');
      this.setListeners();
    },

    setListeners: function(){
      this.model.on('change:hidden', this.toogleModule, this);
    },

    toogleModule: function(){
      this.$el.toggleClass('hide', this.model.get('hidden'));
    },

    toogleEmbedLegend: function(e){
      e && e.preventDefault();
      var active = this.$titleDialog.hasClass('active');
      this.$titleDialog.toggleClass('active', !active);
      this.$categories.toggleClass('active', !active);
      this.$buttonLegendBox.toggleClass('active', !active);

    },

    openGFW: function(){
      if (this.embed && !!this.$linkLegendBox) {
        var href = window.location.href.replace('/embed','');
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
      _.each(layers, function(layer) {
        layer.source = (layer.slug === 'nothing') ? null : layer.slug;
        if (this.detailsTemplates[layer.slug]) {
          layer.detailsTpl = this.detailsTemplates[layer.slug]({
            threshold: options.threshold || 30,
            layerTitle: layer.title,
            minrange: options.minrange || '0',
            maxrange: options.maxrange || '917'         
          });
        }
        if (layer.iso) {
          var countries = amplify.store('countries');
          iso = layer.iso;
          layersIso.push(layer);
          layer.category_status = layer.category_slug+'-iso';
        } else {
          layersGlobal.push(layer);
          layer.category_status = layer.category_slug+'-global'
        }
        layer.geographic = geographic ? 'checked' : '';
      }, this);

      categoriesGlobal = this.statusCategories(_.groupBy(layersGlobal, function(layer){ return layer.category_slug }));
      categoriesIso = this.statusCategories(_.groupBy(layersIso, function(layer){ return layer.category_slug }));

      if (iso) {
        var country = _.find(amplify.store('countries'), _.bind(function(country){
          return country.iso === iso;
        }, this ));
      }
      var name = (country) ? country.name : iso;

      var html = this.template({
        categories: (jQuery.isEmptyObject(categoriesGlobal)) ? false : categoriesGlobal,
        categoriesIso: categoriesIso,
        layersLength: layersLength,
        iso: iso,
        name: name
      });

      this.render(html);
    },

    statusCategories: function(array){
      // Search for layer 'nothing'
      var categories_status = this.model.get('categories_status');
      _.each(array, function(category) {
        for (var i = 0; i< category.length; i++) {
          // Mantain categories closed in rendering
          (categories_status.indexOf(category[i]['category_status']) != -1) ? category['closed'] = true : category['closed'] = false;
          // Get layer's length of each category
          category['layers_length'] = i + 1;
        }
      }, this);

      return array;
    },

    toogleLegend: function(bool){
      var to = (bool && bool.currentTarget) ? false : bool;
      this.$el.toggleClass('active', to);
      this.presenter.toggleOverlay(to);
    },

    /**
     * Toggle selected sublayers on the legend widget.
     *
     * @param  {object} layers The layers object
     */
    toggleSelected: function(layers) {
      _.each(this.$el.find('.layer-sublayer'), function(div) {
        var $div = $(div);
        var $toggle = $div.find('.onoffswitch');
        var layer = layers[$div.data('sublayer')];

        if (layer) {
          $toggle.addClass('checked');
          $toggle.css('background', layer.category_color);
        } else {
          $toggle.removeClass('checked').css('background', '');
        }
      }, this);
    },

    render: function(html) {
      this.$el.html(html);
      this.$titleDialog = $('#title-dialog-legend');
      this.$categories = this.$el.find('.categories');
      this.$buttonLegendBox =  $('#button-box-embed-legend');
      this.$linkLegendBox =  $('#link-embed-legend');
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
        this.model.set({'hidden': false, 'boxClosed': false});
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

    _toogleCategory: function(e){
      if ($(window).width() > window.gfw.config.GFW_MOBILE) {
        // Save category status in an array
        var categories_status = this.model.get('categories_status');
        var slug = $(e.currentTarget).data('category_slug');
        var index = categories_status.indexOf(slug);
        (index != -1) ? categories_status.splice(index, 1) : categories_status.push(slug);
        this.model.set('categories_status',categories_status);

        $(e.currentTarget).parent().toggleClass('closed');
        $(e.currentTarget).parent().children('.layers').toggleClass('closed');
      }
    },

    _removeLayer: function(e){
      e && e.preventDefault();
      var layerSlug = $(e.currentTarget).data('slug');
      this.presenter.toggleLayer(layerSlug);
    },

    _showCanopy: function(e){
      if (!! e.target.parentNode.classList.contains('minavgmax')) return this._getUncertainty(e);
      if (!! e.target.parentNode.classList.contains('range'))     return;
      e && e.preventDefault();
      this.presenter.showCanopy();
    },

    _getUncertainty: function(e) {
      this.presenter.changeUncertainty(e.target.dataset);
    },

    _setUncertaintyOptionUI: function(type) {
      var $opt = this.$el.find('[data-quantity="'+type+'"]');
      $opt.addClass('current').siblings('.current').removeClass('current');
    },
    toggleLegendOptions: function(e) {
      $(e.target).find('span').toggleClass('active');
      $(e.target).siblings('.toggle-legend-option').toggle('250');
    },
    updateRange: function(e) {
      var newrange = this.$el.find('input');
      var targets = this.$el.find('.labels em');
      newrange = [newrange[0].value,newrange[1].value];
      if (~~newrange[0] < 0) return this.resetRanges('min');
      if (~~newrange[0] > 917) return this.resetRanges('min');
      if (~~newrange[1] > 917) return this.resetRanges('max');
      if (~~newrange[1] < 0) return this.resetRanges('max');
      targets.first().html(newrange[0]);
      targets.last().html(newrange[1]);
      this.presenter.setNewRange([newrange[0],newrange[1]]);
    },
    resetRanges: function(end) {
      var newrange = this.$el.find('input');
      var targets = this.$el.find('.labels em');
      if (end === 'min'){
        newrange[0].value = 0;
        targets.first().html('0');
      }
      if (end === 'max'){
        newrange[1].value = 917;
        targets.last().html('917');
      }
    }

  });

  return LegendView;
});
