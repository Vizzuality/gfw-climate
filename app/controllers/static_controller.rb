class StaticController < ApplicationController

  skip_before_action :check_terms, only: :accept_terms

  def terms
  end

  def accept_terms
    redirect_to root_path if terms_cookie
  end

  def data_methods
  end

  def about
    @title = 'About'
  end

  def forest_change_data
    file = File.join(Rails.root, 'lib', 'data', 'forest_area_change_table.csv')
    @table = CSV.read(file)
    @table.shift
  end

  def biomass_data
    file = File.join(Rails.root, 'lib', 'data', 'biomass_table.csv')
    @table = CSV.read(file)
    @table.shift
  end
end
