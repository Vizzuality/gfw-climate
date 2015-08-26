require "rails_helper"

RSpec.describe Jurisdiction, type: :model do

  context "Get certain jurisdiction" do

    it "Find jurisdiction by country and id" do
      jurisdiction = Jurisdiction.find_jurisdiction(id: 'aus', id_1: 1)
      expect(jurisdiction['name_1']).to eq('Ashmore and Cartier Islands')
    end

    it "Find jurisdiction with umd data" do
      jurisdiction = Jurisdiction.find_umd(id: 'aus', id_1: 1)
      expect(jurisdiction[0]['country']).to eq('Australia')
      expect(jurisdiction[0]['iso']).to eq('AUS')
    end

  end

end