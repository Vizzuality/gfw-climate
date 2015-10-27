require "rails_helper"

RSpec.describe Country, type: :model do

  context "Get list of countries" do

    it "Find all countries" do
      countries = Country.find_all
      expect(countries[0]['name']).to eq 'Angola'
    end

  end

  context "Get certain country" do

    it "Find country by iso" do
      country = Country.find_country(id: 'bra')
      expect(country['name']).to eq 'Brazil'
    end

  end

end
