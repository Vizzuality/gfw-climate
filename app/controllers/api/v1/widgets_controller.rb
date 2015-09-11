module Api::V1
  class WidgetsController < BaseControllerV1

    before_action :set_widget, only: :show

    def index
      @widgets = Widget.all
      respond_with @widgets
    end

    def show
      respond_with @widget
    end

    private
      def set_widget
        @widget = Widget.find(params[:id])
      end

  end
end
