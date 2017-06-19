module Api::V1
  class DataPortalDownloadsController < BaseControllerV1
    def index
      zip_file = DataPortalDownload.new(download_params).as_zip
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
        :start_year,
        :end_year,
        {units: []},
        {indicator_ids: []},
        {thresholds: []},
        :json,
        :pivot
      )
    end
  end
end
