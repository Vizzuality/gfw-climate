module Api::V1
  class DataPortalDownloadsController < BaseControllerV1
    def index
      begin
        zip_file = DataPortalDownload.new(download_params).as_zip
      rescue CartoDbError => e
        Rails.logger.error e.message
        render json: e.message, status: :unprocessable_entity and return
      end
      send_file(
        zip_file.path, type: 'application/zip', filename: 'download.zip'
      )
    end

    private

    def download_params
      params.permit(
        {country_codes: []},
        {jurisdiction_ids: []},
        {area_ids: []},
        {years: []},
        {units: []},
        {widget_ids: []},
        {thresholds: []},
        :json,
        :pivot
      )
    end
  end
end
