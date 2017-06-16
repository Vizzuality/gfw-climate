require "rails_helper"

RSpec.describe DataPortalDownload, type: :model do
  describe :as_zip do
    context :validation do
      it 'fails when country not given' do
        dpd = DataPortalDownload.new({})
        expect { dpd.as_zip }.to raise_error(RuntimeError)
      end
      it 'fails when indicators not given' do
        dpd = DataPortalDownload.new({iso: 'BRA'})
        expect { dpd.as_zip }.to raise_error(RuntimeError)
      end
    end
  end

  describe :as_zip do
    context 'CSV' do
      let(:dpd){ DataPortalDownload.new({iso: 'BRA', indicator_ids: [1]}) }
      let(:zipfile){
        VCR.use_cassette("data_portal_download") do
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
      it 'non-pivot has many for single indicator' do
        expect(
          tree_cover_loss_entry.get_input_stream { |io| io.readlines.length }
        ).to eq(121)
      end
      context 'pivot' do
        let(:dpd){
          DataPortalDownload.new({iso: 'BRA', indicator_ids: [1], pivot: true})
        }
        it 'pivot has one data row for single indicator' do
          expect(
            tree_cover_loss_entry.get_input_stream { |io| io.readlines.length }
          ).to eq(2)
        end
      end
    end
    it 'creates JSON files' do
      dpd = DataPortalDownload.new(
        {iso: 'BRA', indicator_ids: [1], json: true}
      )
      zipfile = VCR.use_cassette("data_portal_download") do
        dpd.as_zip
      end
      expect(
        Zip::File.open(zipfile.path).entries.map(&:name)
      ).to match_array(['indicators/Tree cover loss.json'])
    end
  end
end
