require "rails_helper"

RSpec.describe DataPortalDownload, type: :model do
  describe :as_zip do
    context :validation do
      it 'fails when indicators not given' do
        dpd = DataPortalDownload.new({country_codes: ['BRA'], widget_ids: []})
        expect { dpd.as_zip }.to raise_error(RuntimeError)
      end
    end
  end

  describe :as_zip do
    context 'CSV' do
      let(:dpd){
        DataPortalDownload.new(
          {
            country_codes: ['BRA'],
            widget_ids: ['1'],
            years: [2009, 2011],
            thresholds: [25, 30],
          }
        )
      }
      let(:zipfile){
        VCR.use_cassette("data_portal_download") do
          dpd.as_zip
        end
      }
      let(:tree_cover_loss_entry){
        Zip::File.open(zipfile.path).entries.first
      }
     # it 'creates CSV files' do
     #   expect(
     #     Zip::File.open(zipfile.path).entries.map(&:name)
     #   ).to match_array(['indicators/Tree cover loss.csv'])
     # end
      it 'non-pivot has many for single indicator' do
        expect(
          tree_cover_loss_entry.get_input_stream { |io| io.readlines.length }
        ).to eq(5)
      end
      context 'pivot' do
        let(:dpd){
          DataPortalDownload.new(
            {
            country_codes: ['BRA'],
            widget_ids: ['1'],
            years: [2009, 2011],
            thresholds: [25, 30],
              pivot: true
            }
          )
        }
        it 'has two data row for single indicator' do
          expect(
            tree_cover_loss_entry.get_input_stream { |io| io.readlines.length }
          ).to eq(3)
        end
      end
      context 'all countries pivot' do
        let(:widget_ids){ ['1'] }
        let(:dpd){
          DataPortalDownload.new({widget_ids: widget_ids, pivot: true})
        }
        let(:zipfile){
          VCR.use_cassette("data_portal_download-all_countries") do
            dpd.as_zip
          end
        }
        it 'has one data row per country/threshold for single indicator' do
          expect(
            tree_cover_loss_entry.get_input_stream { |io| io.readlines.length }
          ).to eq(1761)
        end
      end
    end
    context 'JSON' do
      let(:dpd){
        DataPortalDownload.new(
          {
            country_codes: ['BRA'],
            widget_ids: ['1'],
            years: [2009, 2011],
            thresholds: [25, 30],
            json: true
          }
        )
      }
      let(:zipfile){
        VCR.use_cassette("data_portal_download") do
          dpd.as_zip
        end
      }
      #it 'creates JSON files' do
      #  expect(
      #    Zip::File.open(zipfile.path).entries.map(&:name)
      #  ).to match_array(['indicators/Tree cover loss.json'])
      #end
    end
  end
end
