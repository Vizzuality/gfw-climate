require "rails_helper"

RSpec.describe Country, type: :model do

  context "Get list of countries" do

    it "Find all countries" do
      countries = VCR.use_cassette("country-find_all") do
        Country.find_all
      end
      expect(countries[0]['name']).to eq 'Angola'
    end

  end

  context "Get certain country" do

    it "Find country by iso" do
      country = VCR.use_cassette("country-find_country") do
        Country.find_country(id: 'bra')
      end
      expect(country['name']).to eq 'Brazil'
    end

  end

end
