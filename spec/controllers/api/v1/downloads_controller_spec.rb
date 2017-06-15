require 'rails_helper'

RSpec.describe Api::V1::DownloadsController, type: :controller do
  describe 'GET index' do
    it 'returns a zip file' do
      VCR.use_cassette('download') do
        get :index, iso: 'BRA', indicator_ids: [1]
      end
      expect(response.content_type).to eq('application/zip')
      expect(response.headers['Content-Disposition']).to eq(
        'attachment; filename="download.zip"'
      )
    end
  end
end
