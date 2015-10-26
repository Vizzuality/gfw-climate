module Api::V1
  class WidgetsController < BaseControllerV1

    before_action :set_widget, only: :show
    before_action :set_default_filter

    def index
      @widgets = Widget.find_widgets(filters_params)
      respond_with @widgets, default_filter: @default_filter
    end

    def show
      respond_with @widget, default_filter: @default_filter
    end

    private
      def set_widget
        @widget = Widget.find(params[:id])
      end

      def filters_params
        params.permit(:default, :iso, :id_1, :thresh, :format)
      end

      def set_default_filter
        @default_filter  = {}
        @default_filter[:iso]    = params[:iso] if params[:iso].present?
        @default_filter[:id_1]   = params[:id_1] if params[:id_1].present?
        @default_filter[:thresh] = params[:thresh] if params[:thresh].present?
      end

  end
end
