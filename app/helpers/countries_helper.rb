module CountriesHelper

  def map_coords
    @latlng = JSON.parse(@country['latlng'])
    "#{map_path}/5/#{@latlng['coordinates'][0].round(2)}/#{@latlng['coordinates'][1].round(2)}/#{@country['iso']}"
  end

end
