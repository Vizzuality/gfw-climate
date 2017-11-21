require "rails_helper"

RSpec.describe Indicator, type: :model do
  context "Get list of indicators" do
    it "Find all indicators" do
      indicators = VCR.use_cassette("indicator-find_all") do
        Indicator.find_all
      end
      expect(indicators[0]['indicator_id']).to eq 1
    end
  end

  context "Get certain indicator" do
    it "Find indicator by iso and id" do
      indicators = VCR.use_cassette("indicator-find_by_id_and_iso") do
        Indicator.find_indicator(id: 1, iso: 'bra')
      end
      expect(indicators.length).to eq 16
    end
  end
end
