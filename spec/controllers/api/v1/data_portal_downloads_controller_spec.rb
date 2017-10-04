require 'rails_helper'

RSpec.describe Api::V1::DataPortalDownloadsController, type: :controller do
  describe 'GET index' do
    it 'returns a zip file' do
      VCR.use_cassette('data_portal_download') do
        get :index,
          country_codes: ['BRA'],
          indicator_ids: [1],
          years: [2009, 2011],
          thresholds: [25, 30]
      end
      expect(response.content_type).to eq('application/zip')
      expect(response.headers['Content-Disposition']).to eq(
        'attachment; filename="download.zip"'
      )
    end
  end
end
