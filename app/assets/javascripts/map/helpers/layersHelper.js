/**
 * Map layers slug with layer files. (like views and dialog templates)
 */
define([
  // Layer views
  'map/views/layers/IntactForestLayer2013',
  'map/views/layers/LoggingLayer',
  'map/views/layers/MiningLayer',
  'map/views/layers/OilPalmLayer',
  'map/views/layers/WoodFiberPlantationsLayer',
  'map/views/layers/DamHotspotsLayer',
  'map/views/layers/CarbonStocksLayer',
  'map/views/layers/BiomassLossLayer',
  'map/views/layers/DrcPrimaryForestLayer',
  'map/views/layers/IdnPeatLandsLayer',
  'map/views/layers/SoilOrganicCarbonDLayer',
  'map/views/layers/PlantationsLayerByType',
  'map/views/layers/PlantationsLayerBySpecies',
  'map/views/layers/ProtectedAreasCDBLayer',
  'map/views/layers/PeatLandsDrainageLayer',
  'map/views/layers/IdnPrimaryLayer',
  'map/views/layers/CafLoggingLayer',
  'map/views/layers/CanLoggingLayer',
  'map/views/layers/CmrLoggingLayer',
  'map/views/layers/CodLoggingLayer',
  'map/views/layers/GabLoggingLayer',
  'map/views/layers/GnqLoggingLayer',
  'map/views/layers/IdnLoggingLayer',
  'map/views/layers/LbrLoggingLayer',
  'map/views/layers/CogLoggingLayer',
  'map/views/layers/MysLoggingLayer',
  'map/views/layers/CanMiningLayer',
  'map/views/layers/CmrMiningLayer',
  'map/views/layers/CodMiningLayer',
  'map/views/layers/CogMiningLayer',
  'map/views/layers/GabMiningLayer',
  'map/views/layers/ColMiningLayer',
  'map/views/layers/KhmMiningLayer',
  'map/views/layers/CogOilPalmLayer',
  'map/views/layers/LbrOilPalmLayer',
  'map/views/layers/CmrOilPalmLayer',
  'map/views/layers/IdnOilPalmLayer',
  'map/views/layers/MysOilPalmLayer',
  'map/views/layers/GabWoodFiberPlantationsLayer',
  'map/views/layers/CogWoodFiberPlantationsLayer',
  'map/views/layers/IdnWoodFiberPlantationsLayer',
  'map/views/layers/MysWoodFiberPlantationsLayer',
  'map/views/layers/CmrResourceRightsLayer',
  'map/views/layers/LbrResourceRightsLayer',
  'map/views/layers/GnqResourceRightsLayer',
  'map/views/layers/NamResourceRightsLayer',
  'map/views/layers/AusLandRightsLayer',
  'map/views/layers/PanLandRightsLayer',
  'map/views/layers/BraLandRightsLayer',
  'map/views/layers/CanLandRightsLayer',
  'map/views/layers/CriLandRightsLayer',
  'map/views/layers/NzlLandRightsLayer',
  'map/views/layers/ConcesionesForestalesLayer',
  'map/views/layers/ConcesionesForestalesNotSupervisedLayer',
  'map/views/layers/ColombiaForestChangeLayer',
  'map/views/layers/UsaConservationEasementsLayer',
  'map/views/layers/UsaLandCoverLayer',
  'map/views/layers/UsaLandCoverChangeLayer',
  'map/views/layers/BraBiomesLayer',
  'map/views/layers/IdnLeuserLayer',
  'map/views/layers/PerPermForestLayer',
  'map/views/layers/BraPlantationsLayerByType',
  'map/views/layers/BraPlantationsLayerBySpecies',
  'map/views/layers/PerPlantationsLayerByType',
  'map/views/layers/PerPlantationsLayerBySpecies',
  'map/views/layers/LbrPlantationsLayerByType',
  'map/views/layers/LbrPlantationsLayerBySpecies',
  'map/views/layers/ColPlantationsLayerByType',
  'map/views/layers/ColPlantationsLayerBySpecies',
  'map/views/layers/KhmPlantationsLayerByType',
  'map/views/layers/KhmPlantationsLayerBySpecies',
  'map/views/layers/IdnPlantationsLayerByType',
  'map/views/layers/IdnPlantationsLayerBySpecies',
  'map/views/layers/MysPlantationsLayerByType',
  'map/views/layers/MysPlantationsLayerBySpecies',
  'map/views/layers/PerBufferLayer',
  'map/views/layers/PerNatPALayer',
  'map/views/layers/PerPrivPALayer',
  'map/views/layers/PerRegPALayer',
  'map/views/layers/IdnForMorLayer',
  'map/views/layers/GtmForestChange1Layer',
  'map/views/layers/GtmForestChange2Layer',
  'map/views/layers/GtmForestCoverLayer',
  'map/views/layers/GtmForestDensityLayer',
  'map/views/layers/KhmProtectedAreasLayer',
  'map/views/layers/KhmEcoLandLayer',
  'map/views/layers/UsaForestOwnershipLayer',
  'map/views/layers/RusHcvLayer',
  'map/views/layers/MysPALayer',
  'map/views/layers/PerMiningLayer',
  'map/views/layers/MexMiningLayer',
  'map/views/layers/BraMiningLayer',
  'map/views/layers/PerMinamCoverLayer',
  'map/views/layers/WMSLayer',
  'map/views/layers/MangroveBiomassLayer',
  'map/views/layers/CustomDarkBaseLabelsLayer',
  'map/views/layers/CustomDarkOnlyLabelsLayer',
  // Layer dialog templates
  // 'text!templates/dialogs/loss_dialog.handlebars',
  // Layers timelines
  'map/views/timeline/LossTimeline'
], function(
  // Layer Views
  IntactForestLayer2013,
  LoggingLayer,
  MiningLayer,
  OilPalmLayer,
  WoodFiberPlantationsLayer,
  DamHotspotsLayer,
  CarbonstocksLayer,
  BiomassLoss,
  DrcPrimaryForestLayer,
  IdnPeatLandsLayer,
  SoilOrganicCarbonDLayer,
  PlantationsLayerByType,
  PlantationsLayerBySpecies,
  ProtectedAreasCDBLayer,
  PeatLandsDrainageLayer,
  IdnPrimaryLayer,
  CafLoggingLayer,
  CanLoggingLayer,
  CmrLoggingLayer,
  CodLoggingLayer,
  GabLoggingLayer,
  GnqLoggingLayer,
  IdnLoggingLayer,
  LbrLoggingLayer,
  CogLoggingLayer,
  MysLoggingLayer,
  CanMiningLayer,
  CmrMiningLayer,
  CodMiningLayer,
  CogMiningLayer,
  GabMiningLayer,
  ColMiningLayer,
  KhmMiningLayer,
  CogOilPalmLayer,
  LbrOilPalmLayer,
  CmrOilPalmLayer,
  IdnOilPalmLayer,
  MysOilPalmLayer,
  GabWoodFiberPlantationsLayer,
  CogWoodFiberPlantationsLayer,
  IdnWoodFiberPlantationsLayer,
  MysWoodFiberPlantationsLayer,
  CmrResourceRightsLayer,
  LbrResourceRightsLayer,
  GnqResourceRightsLayer,
  NamResourceRightsLayer,
  AusLandRightsLayer,
  PanLandRightsLayer,
  BraLandRightsLayer,
  CanLandRightsLayer,
  CriLandRightsLayer,
  NzlLandRightsLayer,
  ConcesionesForestalesLayer,
  ConcesionesForestalesNotSupervisedLayer,
  ColombiaForestChangeLayer,
  UsaConservationEasementsLayer,
  UsaLandCoverLayer,
  UsaLandCoverChangeLayer,
  BraBiomesLayer,
  IdnLeuserLayer,
  PerPermForestLayer,
  BraPlantationsLayerByType,
  BraPlantationsLayerBySpecies,
  PerPlantationsLayerByType,
  PerPlantationsLayerBySpecies,
  LbrPlantationsLayerByType,
  LbrPlantationsLayerBySpecies,
  ColPlantationsLayerByType,
  ColPlantationsLayerBySpecies,
  KhmPlantationsLayerByType,
  KhmPlantationsLayerBySpecies,
  IdnPlantationsLayerByType,
  IdnPlantationsLayerBySpecies,
  MysPlantationsLayerByType,
  MysPlantationsLayerBySpecies,
  PerBufferLayer,
  PerNatPALayer,
  PerPrivPALayer,
  PerRegPALayer,
  IdnForMorLayer,
  GtmForestChange1Layer,
  GtmForestChange2Layer,
  GtmForestCoverLayer,
  GtmForestDensityLayer,
  KhmProtectedAreasLayer,
  KhmEcoLandLayer,
  UsaForestOwnershipLayer,
  RusHcvLayer,
  MysPALayer,
  PerMiningLayer,
  MexMiningLayer,
  BraMiningLayer,
  PerMinamCoverLayer,
  WMSLayer,
  MangroveBiomassLayer,
  CustomDarkBaseLabelsLayer,
  CustomDarkOnlyLabelsLayer,
  // Layer dialog templates
  // loss_dialog,
  // Layer timelines
  LossTimeline) {

  'use strict';

  var layersHelper = {
    custom_dark_base_labels: {
      view: CustomDarkBaseLabelsLayer
    },
    custom_dark_only_labels: {
      view: CustomDarkOnlyLabelsLayer
    },
    biomass_loss: {
      view: BiomassLoss,
      timelineView: LossTimeline
    },
    idn_primary: {
      view: IdnPrimaryLayer
    },
    ifl_2013_deg: {
      view: IntactForestLayer2013
    },
    logging: {
      view: LoggingLayer
    },
    caf_logging: {
      view: CafLoggingLayer
    },
    can_logging: {
      view: CanLoggingLayer
    },
    cmr_logging: {
      view: CmrLoggingLayer
    },
    cod_logging: {
      view: CodLoggingLayer
    },
    gab_logging: {
      view: GabLoggingLayer
    },
    gnq_logging: {
      view: GnqLoggingLayer
    },
    idn_logging: {
      view: IdnLoggingLayer
    },
    lbr_logging: {
      view: LbrLoggingLayer
    },
    cog_logging: {
      view: CogLoggingLayer
    },
    mys_logging: {
      view: MysLoggingLayer
    },
    mining: {
      view: MiningLayer
    },
    can_mining: {
      view: CanMiningLayer
    },
    cmr_mining: {
      view: CmrMiningLayer
    },
    cod_mining: {
      view: CodMiningLayer
    },
    cog_mining: {
      view: CogMiningLayer
    },
    gab_mining: {
      view: GabMiningLayer
    },
    col_mining: {
      view: ColMiningLayer
    },
    khm_mining: {
      view: KhmMiningLayer
    },
    oil_palm: {
      view: OilPalmLayer
    },
    cog_oil_palm: {
      view: CogOilPalmLayer
    },
    lbr_oil_palm: {
      view: LbrOilPalmLayer
    },
    cmr_oil_palm: {
      view: CmrOilPalmLayer
    },
    idn_oil_palm: {
      view: IdnOilPalmLayer
    },
    mys_oil_palm: {
      view: MysOilPalmLayer
    },
    wood_fiber_plantations: {
      view: WoodFiberPlantationsLayer
    },
    cog_wood_fiber: {
      view: CogWoodFiberPlantationsLayer
    },
    gab_wood_fiber: {
      view: GabWoodFiberPlantationsLayer
    },
    idn_wood_fiber: {
      view: IdnWoodFiberPlantationsLayer
    },
    mys_wood_fiber: {
      view: MysWoodFiberPlantationsLayer
    },
    cmr_resource_rights: {
      view: CmrResourceRightsLayer
    },
    lbr_resource_rights: {
      view: LbrResourceRightsLayer
    },
    gnq_resource_rights: {
      view: GnqResourceRightsLayer
    },
    nam_resource_rights: {
      view: NamResourceRightsLayer
    },
    aus_land_rights: {
      view: AusLandRightsLayer
    },
    pan_land_rights: {
      view: PanLandRightsLayer
    },
    bra_land_rights: {
      view: BraLandRightsLayer
    },
    can_land_rights: {
      view: CanLandRightsLayer
    },
    cri_land_rights: {
      view: CriLandRightsLayer
    },
    nzl_land_rights: {
      view: NzlLandRightsLayer
    },
    concesiones_forestales :{
      view: ConcesionesForestalesLayer
    },
    concesiones_forestalesNS :{
      view: ConcesionesForestalesNotSupervisedLayer
    },
    colombia_forest_change: {
      view: ColombiaForestChangeLayer
    },
    dam_hotspots: {
      view: DamHotspotsLayer
    },
    usa_conservation_easements: {
      view: UsaConservationEasementsLayer
    },
    us_land_cover: {
      view: UsaLandCoverLayer
    },
    us_land_cover_change: {
      view: UsaLandCoverChangeLayer
    },
    carbon_stocks: {
      view: CarbonstocksLayer
    },
    cod_primary_forest_wgs: {
      view: DrcPrimaryForestLayer
    },
    bra_biomes: {
      view: BraBiomesLayer
    },
    idn_leuser: {
      view: IdnLeuserLayer
    },
    idn_peatland_drainage: {
      view: PeatLandsDrainageLayer
    },
    hwsd: {
      view: SoilOrganicCarbonDLayer
    },
    per_prod_for: {
      view: PerPermForestLayer
    },

    plantations_by_type: {
      view: PlantationsLayerByType
    },
    plantations_by_species: {
      view: PlantationsLayerBySpecies
    },
    bra_plantations_type: {
      view: BraPlantationsLayerByType
    },
    bra_plantations_species: {
      view: BraPlantationsLayerBySpecies
    },
    per_plantations_type: {
      view: PerPlantationsLayerByType
    },
    per_plantations_species: {
      view: PerPlantationsLayerBySpecies
    },
    lbr_plantations_type: {
      view: LbrPlantationsLayerByType
    },
    lbr_plantations_species: {
      view: LbrPlantationsLayerBySpecies
    },
    col_plantations_type: {
      view: ColPlantationsLayerByType
    },
    col_plantations_species: {
      view: ColPlantationsLayerBySpecies
    },
    khm_plantations_type: {
      view: KhmPlantationsLayerByType
    },
    khm_plantations_species: {
      view: KhmPlantationsLayerBySpecies
    },
    idn_plantations_type: {
      view: IdnPlantationsLayerByType
    },
    idn_plantations_species: {
      view: IdnPlantationsLayerBySpecies
    },
    mys_plantations_type: {
      view: MysPlantationsLayerByType
    },
    mys_plantations_species: {
      view: MysPlantationsLayerBySpecies
    },
    per_buffer: {
      view: PerBufferLayer
    },
    per_nat_pa: {
      view: PerNatPALayer
    },
    per_priv_pa: {
      view: PerPrivPALayer
    },
    per_reg_pa: {
      view: PerRegPALayer
    },
    idn_for_mor: {
      view: IdnForMorLayer
    },
     gtm_forest_change1: {
      view: GtmForestChange1Layer
    },
     gtm_forest_change2: {
      view: GtmForestChange2Layer
    },
     gtm_forest_cover: {
      view: GtmForestCoverLayer
    },
     gtm_forest_density: {
      view: GtmForestDensityLayer
    },
    protected_areasCDB: {
      view: ProtectedAreasCDBLayer
    },
    peatland_drainage: {
      view: PeatLandsDrainageLayer
    },
    khm_pa: {
      view: KhmProtectedAreasLayer
    },
    khm_eco_land_conc: {
      view: KhmEcoLandLayer
    },
    usa_forest_ownership: {
      view: UsaForestOwnershipLayer
    },
    rus_hcv: {
      view: RusHcvLayer,
    },
    mys_protected_areas: {
      view:  MysPALayer
    },
    mex_mining: {
      view:  MexMiningLayer
    },

    per_mining: {
      view:  PerMiningLayer
    },

    bra_mining: {
      view:  BraMiningLayer
    },
    per_minam_tree_cover: {
      view:  PerMinamCoverLayer
    },
    WMSLayer :{
      view: WMSLayer
    },
    global_mangroves_biomass: {
      view: MangroveBiomassLayer
    },

    nothing: {
    }
  };

  return layersHelper;

});
