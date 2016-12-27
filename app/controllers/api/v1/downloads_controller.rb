module Api::V1
  class DownloadsController < BaseControllerV1
    def index
      zip_file = Download.new(download_params).as_zip
    end

    private

    def download_params
      params.permit(:iso, :id_1, :area, :start_year, :end_year,
                    units: [], indicator_ids: [], thresholds: [])
    end
  end
end
