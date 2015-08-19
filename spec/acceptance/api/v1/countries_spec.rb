require 'acceptance_helper'

resource 'Countries' do
  header "Accept", "application/json; application/gfwc-v1+json"
  header "Content-Type", "application/json"
  header 'Host', 'gfwc-staging.herokuapp.com'

  get "/api/countries" do
    example_request "Getting a list of enabled countries" do
      expect(status).to eq(200)
      countries = JSON.parse(response_body)['countries']

      expect(countries.length).to eq(167)
      expect(countries[6]['name']).to eq('Australia')
      expect(countries[6]['iso']).to eq('AUS')
      expect(countries[6]['enabled']).to eq(true)
    end
  end

  get "/api/countries/aus" do
    example_request "Getting a specific country" do
      expect(status).to eq(200)
      country = JSON.parse(response_body)['country']

      expect(country['name']).to eq('Australia')
      expect(country['iso']).to eq('AUS')
      expect(country['enabled']).to eq(true)
      expect(country['coordinates'].count).to eq(5)
      expect(country['type']).to eq('Polygon')
      expect(country['emissions']).not_to be_nil
    end
  end

end
