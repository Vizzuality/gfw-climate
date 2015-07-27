class CountriesController < AccessController

  def index
    @countries = Country.find_all
  end

  def show
    @country = Country.find_country(params[:id])
  end

end
