module Api::V1
  class CountriesController < BaseControllerV1

    before_action :set_country, only: [:show, :show_jurisdiction]
    before_action :set_jurisdiction, only: :show_jurisdiction
    before_action :set_jurisdiction_umd, only: :show_jurisdiction

    def index
      @countries = Country.find_all
      respond_with @countries
    end

    def show
      respond_with @country
    end

    def show_jurisdiction
      respond_with @jurisdiction
    end

    private
      def filter_params
        params.permit(:id, :id_1, :thresh, :format)
      end

      def set_country
        @country = Country.find_country(filter_params)
      end

      def set_jurisdiction
        @jurisdiction = Jurisdiction.find_jurisdiction(filter_params)
      end

      def set_jurisdiction_umd
        @umd = Jurisdiction.find_umd(filter_params)
      end

  end
end