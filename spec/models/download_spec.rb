require "rails_helper"

RSpec.describe Download, type: :model do
  describe :as_zip do
    context :validation do
      it 'fails when country not given' do
        dpd = Download.new({})
        expect { dpd.as_zip }.to raise_error(RuntimeError)
      end
      it 'fails when indicators not given' do
        dpd = Download.new({iso: 'BRA'})
        expect { dpd.as_zip }.to raise_error(RuntimeError)
      end
    end
  end

  describe :as_zip do
    let(:dpd){
      Download.new(
        {
          iso: 'BRA',
          indicator_ids: [1],
          start_year: 2009,
          end_year: 2011,
          thresholds: [25, 30],
        }
      )
    }
    let(:zipfile){
      VCR.use_cassette("download") do
        dpd.as_zip
      end
    }
    let(:tree_cover_loss_entry){
      Zip::File.open(zipfile.path).entries.first
    }
    it 'creates CSV files' do
      expect(
        Zip::File.open(zipfile.path).entries.map(&:name)
      ).to match_array(['indicators/Tree cover loss.csv'])
    end
  end
end
