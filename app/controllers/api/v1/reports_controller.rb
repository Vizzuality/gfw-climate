module Api::V1
  class ReportsController < BaseControllerV1
    def index
      @report = CountryReport.new(filter_params).fetch
      render json: @report
    end

    private

    def filter_params
      params.permit(:iso, :reference_start_year, :reference_end_year,
                    :monitor_start_year, :monitor_end_year, :thresh,
                    :below, :primary_forest, :exclude_plantations)
    end
  end
end
