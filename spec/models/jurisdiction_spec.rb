require "rails_helper"

RSpec.describe Jurisdiction, type: :model do

  context "Get certain jurisdiction" do

    it "Find jurisdiction by country and id" do
      jurisdiction = VCR.use_cassette("jurisdiction-find_jurisdiction") do
        Jurisdiction.find_jurisdiction(id: 'bra', id_1: 1)
      end
      expect(jurisdiction['jurisdiction_name']).to eq('Acre')
    end

  end

end
