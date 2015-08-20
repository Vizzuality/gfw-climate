module Api::V1
  class CountriesController < BaseControllerV1

    before_action :set_country, only: :show

    def index
      @countries = Country.find_all
      respond_with @countries
    end

    def show
      respond_with @country
    end

    private
      def filter_params
        params.permit(:id, :thresh)
      end

      def set_country
        @country = Country.find_country(filter_params)
      end

  end
end