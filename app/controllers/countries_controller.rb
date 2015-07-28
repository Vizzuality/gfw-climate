class CountriesController < AccessController

  def index
    @countries = Country.find_all
  end

  def show
    @country   = Country.find_country(params[:id])
    
    @name      = @country['name']
    @iso       = @country['params']['iso']
    @links     = @country['external_links']             if @country['external_links'].present?
    @get_links = JSON.parse(@country['external_links']) if @country['external_links'].present?
  end

end