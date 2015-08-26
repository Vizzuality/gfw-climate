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
    parameter :thresh, "Allowed values for thresh: 10, 15, 20, 25, 30, 50, 75"

    example_request "Getting a specific country", thresh: 50 do
      expect(status).to eq(200)
      country = JSON.parse(response_body)['country']
      
      expect(country['iso']).to eq('AUS')
      expect(country['thresh']).to eq('50')
      expect(country['enabled']).to eq(true)
      expect(country['name']).to eq('Australia')
      expect(country['conventions'].count).to eq(10)
      expect(country['emissions']).not_to be_nil
      expect(country['carbon_stocks']).to be_nil
      expect(country['gva']).not_to be_nil
      expect(country['gva_percent']).not_to be_nil
      expect(country['bounds']['coordinates'].count).to eq(5)
      expect(country['bounds']['type']).to eq('Polygon')
      expect(country['tenure'].count).to eq(5)
      expect(country['forests'].count).to eq(3)
      expect(country['umd']).not_to be_nil
      expect(country['umd'][0]['thresh']).to eq(50)
      expect(country['jurisdictions']).not_to be_nil
    end

    example "Getting a specific country with thresh 75", document: false do
      do_request(thresh: '75')
      expect(status).to eq(200)
      country = JSON.parse(response_body)['country']
      
      expect(country['iso']).to eq('AUS')
      expect(country['thresh']).to eq('75')
      expect(country['umd'][0]['thresh']).to eq(75)
    end

    example "Getting a specific country without thresh", document: false do
      do_request
      expect(status).to eq(200)
      country = JSON.parse(response_body)['country']
      
      expect(country['iso']).to eq('AUS')
      expect(country['thresh']).to eq(10)
      expect(country['umd'][0]['thresh']).to eq(10)
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
      expect(jurisdiction['umd']).not_to be_nil
    end

    example "Getting a specific jurisdiction with thresh 75", document: false do
      do_request(thresh: '75')
      expect(status).to eq(200)
      jurisdiction = JSON.parse(response_body)['jurisdiction']
      
      expect(jurisdiction['iso']).to eq('BRA')
      expect(jurisdiction['thresh']).to eq('75')
      expect(jurisdiction['umd'][0]['thresh']).to eq(75)
    end

    example "Getting a specific jurisdiction without thresh", document: false do
      do_request
      expect(status).to eq(200)
      jurisdiction = JSON.parse(response_body)['jurisdiction']
      
      expect(jurisdiction['iso']).to eq('BRA')
      expect(jurisdiction['thresh']).to eq(10)
      expect(jurisdiction['umd'][0]['thresh']).to eq(10)
    end
  end

end
