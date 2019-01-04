module Api::V1
  class BaseControllerV1 < ApplicationController

    respond_to :json

    before_action :set_access_control_headers

    def set_access_control_headers
      headers['Access-Control-Allow-Origin'] = '*'
      headers['Access-Control-Allow-Methods'] = 'GET'
      headers['Access-Control-Expose-Headers'] = 'Link, Total, Per-Page'
    end
  end
end
