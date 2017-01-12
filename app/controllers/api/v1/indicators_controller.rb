module Api::V1
  class IndicatorsController < BaseControllerV1

    before_action :set_indicator, only: :show

    def index
      @indicators = Indicator.find_all
      respond_with @indicators
    end

    def show
      respond_with @indicator
    end

    private
      def filter_params
        params.permit(:id, :iso, :id_1, :area, :thresh, :format)
      end

      def set_indicator
        @indicator = Indicator.find_indicator(filter_params)
      end
  end
end
