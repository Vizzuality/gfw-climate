class MapController < ApplicationController

  def index
  	@title = 'Interactive Map'
  	@desc = 'Explore the status of forests worldwide by layering data to create custom maps of forest change, cover, and use.'
  	@keywords = 'map, forest map, visualization, data, forest data, geospatial, gis, geo, spatial, analysis,
  		local data, global data, forest analysis, explore, layer, terrain, alerts, tree, cover, loss, search, country, deforestation'
  end

  def embed
  end

end
