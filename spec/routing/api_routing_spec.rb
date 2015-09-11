require 'rails_helper'

RSpec.describe "API routing", type: :routing do

  describe 'Countries routing' do

    it 'Current version to v1 for index' do
      expect(get: "/api/countries").to route_to(controller: "api/v1/countries", action: "index", format: "json")
    end

    it 'Current version to v1 for show' do
      expect(get: "/api/countries/aus").to route_to(controller: "api/v1/countries", action: "show", format: "json", id: "aus")
    end

    it 'Current version to v1 for show_jurisdiction' do
      expect(get: "/api/countries/aus/5").to route_to(controller: "api/v1/countries", action: "show_jurisdiction", format: "json", id: "aus", id_1: "5")
    end

  end

  describe "Widgets routing" do

    it 'Current version to v1 for index' do
      expect(get: "/api/widgets").to route_to(controller: "api/v1/widgets", action: "index", format: "json")
    end

    it 'Current version to v1 for show' do
      expect(get: "/api/widgets/1").to route_to(controller: "api/v1/widgets", action: "show", format: "json", id: "1")
    end

  end

end
