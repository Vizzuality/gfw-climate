class InsightsController < ApplicationController

  layout 'insights'

  def index
    @carbon_cycle_insight = ENV['FEATURE_CARBON_CYCLE_INSIGHT'].present?
  end

  def detail
  end

  def emissions_calc_index
  end

  def emissions_calc_show
  end

end
