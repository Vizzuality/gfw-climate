require "rails_helper"

RSpec.describe Indicator, type: :model do

  context "Get list of indicators" do

    it "Find all indicators" do
      indicators = Indicator.find_all
      expect(indicators[0]['indicator_id']).to eq 1
    end

  end

  context "Get certain indicator" do

    it "Find indicator by id" do
      indicator = Indicator.find_indicator(id: 1)
      expect(indicator[0]['year']).to eq 2001
    end

    it "Find indicator by iso and id" do
      indicator = Indicator.find_indicator(id: 1, iso: 'bra')
      expect(indicator[0]['iso']).to eq 'BRA'
    end

  end

end
