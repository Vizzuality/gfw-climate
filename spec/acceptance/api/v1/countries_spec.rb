require 'acceptance_helper'

resource 'Countries' do
  header "Accept", "application/json; application/gfwc-v1+json"
  header "Content-Type", "application/json"
  header 'Host', 'gfwc-staging.herokuapp.com'

  get "/api/countries" do
    example_request "Getting a list of enabled countries" do
      expect(status).to eq(200)
      countries = JSON.parse(response_body)['countries']

      expect(countries.length).to be >= 10
      expect(countries[6]['name']).to eq('Barbados')
      expect(countries[6]['iso']).to eq('BRB')
      expect(countries[6]['enabled']).to eq(true)
    end
  end

  get "/api/countries/aus" do
    parameter :thresh, "Allowed values for thresh: 10, 15, 20, 25, 30, 50, 75"

    example_request "Getting a specific country", thresh: 50 do
      expect(status).to eq(200)
      country = JSON.parse(response_body)['country']

      expect(country['iso']).to eq('AUS')
      expect(country['enabled']).to eq(true)
      expect(country['name']).to eq('Australia')
      expect(country['jurisdictions']).not_to be_nil
    end

  end

  get "/api/countries/bra/1" do
    parameter :thresh, "Allowed values for thresh: 10, 15, 20, 25, 30, 50, 75"

    example_request "Getting a specific jurisdiction", thresh: 50 do
      expect(status).to eq(200)
      jurisdiction = JSON.parse(response_body)['jurisdiction']
      expect(jurisdiction['iso']).to eq('BRA')
      expect(jurisdiction['thresh']).to eq('50')
      expect(jurisdiction['country_name']).to eq('Brazil')
      expect(jurisdiction['name']).to eq('Acre')
      expect(jurisdiction['id']).to eq(1)
      expect(jurisdiction['bounds']).not_to be_nil
    end

  end

end
