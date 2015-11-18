require "rails_helper"

RSpec.describe Jurisdiction, type: :model do

  context "Get certain jurisdiction" do

    it "Find jurisdiction by country and id" do
      jurisdiction = Jurisdiction.find_jurisdiction(id: 'aus', id_1: 1)
      expect(jurisdiction['name_1']).to eq('nil')
    end

  end

end