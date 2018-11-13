module Api::V1
  class DownloadsController < BaseControllerV1
    def index
      zip_file = Download.new(download_params).as_zip
      zip_data = File.read(zip_file.path)
      send_data(zip_data, type: 'application/zip', filename: "download.zip")
    end

    private

    def download_params
      params.permit(:iso, :id_1, :area,
                    :start_date, :end_date, thresh: [],
                    units: [], indicator_ids: [])
    end
  end
end
