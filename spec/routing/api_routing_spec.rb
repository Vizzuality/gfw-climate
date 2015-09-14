require 'rails_helper'

RSpec.describe "API routing", type: :routing do

  it 'Current version to v1' do
    expect(get: "/api/countries").to     route_to(controller: "api/v1/countries", action: "index", format: "json")
    expect(get: "/api/countries/aus").to route_to(controller: "api/v1/countries", action: "show", format: "json", id: "aus")
  end

end
