class CountriesController < ApplicationController

  before_action :set_country, only: [:show]

  def index
    @title = 'Country data'
    @countries = Country.find_all
  end

  def show
    @name = @country['name']
    @iso  = @country['iso']
    @jurisdictions = @country['subnat_bounds']
  end

  def pantropical
    @title = 'Carbon Emissions for Tropical Deforestation'
  end

  def report
  end

  private
    def filter_params
      params.permit(:id, :thresh)
    end

    def set_country
      @country = Country.find_country(filter_params)
    end

end
