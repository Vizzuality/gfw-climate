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
  // Layer dialog templates
  // loss_dialog,
  // Layer timelines
  LossTimeline) {

  'use strict';

  var layersHelper = {
    
    ifl_2013_deg: {
      view: IntactForestLayer2013
    },
    logging: {
      view: LoggingLayer
    },
    mining: {
      view: MiningLayer
    },
    oil_palm: {
      view: OilPalmLayer
    },
    wood_fiber_plantations: {
      view: WoodFiberPlantationsLayer
    },
    dam_hotspots: {
      view: DamHotspotsLayer
    },
    carbon_stocks: {
      view: CarbonstocksLayer
    },
    biomass_loss: {
      view: BiomassLoss,
      timelineView: LossTimeline 
    },
    cod_primary_forest_wgs: {
      view: DrcPrimaryForestLayer
    },
    idn_peat_lands: {
      view: IdnPeatLandsLayer
    },
    hwsd: {
      view: SoilOrganicCarbonDLayer
    },
    plantations_by_type: {
      view: PlantationsLayerByType
    },
    plantations_by_species: {
      view: PlantationsLayerBySpecies
    },
    protected_areasCDB: {
      view: ProtectedAreasCDBLayer
    },
    peatland_drainage: {
      view: PeatLandsDrainageLayer
    },
    
    nothing: {
    }
  };

  return layersHelper;

});
