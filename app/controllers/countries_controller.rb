class CountriesController < ApplicationController

  before_action :set_country, only: :show

  def index
    @countries = Country.find_all
  end

  def show
    @name = @country['name']
    @iso  = @country['params']['iso']
    @jurisdictions = @country['subnat_bounds']
  end

  def pantropical
    @title = 'Pantropical visualization'
    @desc = 'Compare tree cover change across countries and climate domains and view global rankings.'
    @keywords = 'GFW, list, forest data, visualization, data, national, country, analysis, statistic, tree cover loss, tree cover gain, climate domain, boreal, tropical, subtropical, temperate, deforestation, deforesters, overview, global'
  end

  private
    def filter_params
      params.permit(:id, :thresh)
    end

    def set_country
      @country = Country.find_country(filter_params)
    end

end
