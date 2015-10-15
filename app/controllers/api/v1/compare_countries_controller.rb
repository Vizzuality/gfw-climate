module Api::V1
  class CompareCountriesController < BaseControllerV1

    def index
      @objects = ForCompare.find_countries_or_jurisdictions(filter_params)
      @widgets = Widget.all
      respond_with @objects
    end

    private
      def filter_params
        params.permit(:path, :thresh, :format)
      end

  end
end