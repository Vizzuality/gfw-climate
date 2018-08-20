/**
 * The LayerSpecModel model.
 *
 * @return LayerSpecModel (extends Backbone.Model).
 */
define(['underscore', 'backbone'], function(_, Backbone) {
  'use strict';

  var LayerSpecModel = Backbone.Model.extend({
    // You should put more importants layers at the bottom of the layerOrder
    // As you see forestchange layers are the more importants so they will be added to top
    //the order will be Grump, forest cover,Conservation, Forest Use, and People layers and finally  Forest Change layers
    layerOrder: [
      'gtm_forest_change1',
      'gtm_forest_cover',
      'gtm_forest_density',
      'gtm_forest_change2',
      'WMSLayer',

      //LAND COVER
      'cod_primary_forest_wgs',
      'idn_primary',
      'colombia_forest_change',
      'plantations_by_type',
      'plantations_by_species',
      'idn_primary',
      'ifl_2013_deg',
      'idn_peat_lands',
      'protected_areasCDB',
      'aus_land_rights',
      'bra_plantations_species',
      'bra_plantations_type',
      'bra_land_rights',
      'bra_biomes',
      'caf_logging',
      'can_land_rights',
      'can_leases',
      'can_coal',
      'can_mining',
      'can_logging',
      'can_claims',
      'cmr_mining',
      'cmr_oil_palm',
      'cmr_logging',
      'cmr_resource_rights',
      'cod_mining',
      'cod_logging',
      'cog_mining',
      'cog_wood_fiber',
      'cog_oil_palm',
      'cog_logging',
      'col_plantations_type',
      'colombia_forest_change',
      'col_plantations_species',
      'col_mining',
      'cri_land_rights',
      'gab_logging',
      'gab_wood_fiber',
      'gab_mining',
      'gnq_resource_rights',
      'gnq_logging',
      'idn_wood_fiber',
      'idn_plantations_type',
      'idn_plantations_species',
      'idn_oil_palm',
      'idn_leuser',
      'idn_for_mor',
      'idn_logging',
      'khm_eco_land_conc',
      'khm_pa',
      'khm_plantations_species',
      'khm_mining',
      'khm_plantations_type',
      'khm_plantation_wrapper',
      'lbr_oil_palm',
      'lbr_plantations_type',
      'lbr_plantations_species',
      'lbr_logging',
      'lbr_resource_rights',
      'mys_plantations_type',
      'mys_protected_areas',
      'mys_logging',
      'mys_plantations_species',
      'mys_wood_fiber',
      'mys_oil_palm',
      'nam_resource_rights',
      'nzl_land_rights',
      'pan_land_rights',
      'per_buffer',
      'per_reg_pa',
      'per_prod_for',
      'per_nat_pa',
      'per_plantations_species',
      'per_plantations_type',
      'concesiones_forestales',
      'concesiones_forestalesNS',
      'per_priv_pa',
      'us_land_cover',
      'usa_conservation_easements',
      // FOREST USE
      'dam_hotspots',
      'wood_fiber_plantations',
      'oil_palm',
      'mining',
      'logging',
      // Carbon density
      'total_carbon',
      'biomass_carbon',
      'hwsd',
      // Carbon gain
      'total_sg',
      'ysg_msg',
      'pastures',
      'crops_1',

      // Carbon loss
      'carbon_stocks',
      'peatland_drainage',
      'idn_peatland_drainage',
      'biomass_loss',
      'forest_carbon_change',
      'forest_carbon_stocks'
    ],

    categoryOrder: [
      'carbon_loss',
      'carbon_gain',
      'carbon_density',
      'forest_cover',
      'forest_use'
    ],

    /**
     * Add a position attribute to the provided layers.
     *
     * @param  {object} layers
     * @return {object} layers
     */
    positionizer: function(layers) {
      var layerOrder = _.intersection(this.layerOrder, _.pluck(layers, 'slug'));
      _.each(
        layerOrder,
        _.bind(function(slug) {
          layers[slug].position = this.layerOrder.indexOf(slug);
        }, this)
      );

      return layers;
    },

    getLayer: function(where) {
      if (!where) {
        return null;
      }
      var layer = _.findWhere(this.getLayers(), where, this);
      return layer;
    },

    /**
     * Get all the layers uncategorized.
     * {forest2000: {}, gain:{}, ...}
     *
     * @return {object} layers
     */
    getLayers: function() {
      var layers = {};

      _.each(this.toJSON(), function(category) {
        _.extend(layers, category);
      });

      return this.positionizer(layers);
    },

    /**
     * Return baselayers object.
     *
     * @return {object} baselayers
     */
    getBaselayers: function() {
      return this.positionizer(
        this.get('carbon_loss') || this.get('carbon_gain') || {}
      );
    },

    /**
     * Return sublayers object.
     *
     * @return {object} sublayers
     */
    getSublayers: function() {
      var layers = {};

      _.each(_.omit(this.toJSON(), 'carbon_loss'), function(results) {
        layers = _.extend(layers, results);
      });

      return this.positionizer(layers);
    },

    /**
     * Return an ordered array of layers. Order by layer position.
     *
     * @return {array} layers
     */
    getOrderedLayers: function() {
      return _.sortBy(this.getLayers(), function(layer) {
        return layer.position;
      });
    },

    /**
     * Return an ordered array of categories and layers.
     *
     * @return {array} categories
     */
    getLayersByCategory: function() {
      var categories = [];

      _.each(
        this.categoryOrder,
        _.bind(function(categoryName) {
          var category = this.get(categoryName);
          if (category) {
            categories.push(
              _.sortBy(this.positionizer(category), function(layer) {
                return layer.position;
              }).reverse()
            );
          }
        }, this)
      );

      return categories;
    }
  });

  return LayerSpecModel;
});
