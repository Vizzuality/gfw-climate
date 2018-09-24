class InsightsController < ApplicationController

  layout 'insights'

  def index
    @is_production = Rails.env.production?
  end

  def detail
  end

  def emissions_calc_index
  end

  def emissions_calc_show
  end

end
