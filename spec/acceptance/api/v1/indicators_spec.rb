require 'acceptance_helper'

resource 'Indicators' do
  header "Accept", "application/json; application/gfwc-v1+json"
  header "Content-Type", "application/json"
  header 'Host', 'gfwc-staging.herokuapp.com'

  get "/api/indicators" do
    example_request "Getting a list of indicators" do
      expect(status).to eq(200)
      indicators = JSON.parse(response_body)['indicators']

      expect(indicators.length).to eq(44)
      expect(indicators[0]['indicator_id']).to eq(1)
      expect(indicators[0]['indicator_group']).to eq('Deforestation')
      expect(indicators[0]['description']).to eq('Tree cover loss per year ({{years}}) at {{threshold}} threshold in units of hectares')
      expect(indicators[0]['unit']).to eq('hectares')
    end
  end

  get "/api/indicators/:id" do
    parameter :id, "ID of indicator"
    parameter :thresh, "Allowed values for thresh: 10, 15, 20, 25, 30, 50, 75"

    example_request "Getting a specific indicator", id: 1, thresh: 25 do
      expect(status).to eq(200)
      value = JSON.parse(response_body)['values'][0]
      expect(value['thresh']).to eq(25)
    end

    example_request "Getting a specific indicator with thresh 15", document: false do
      do_request(id: 2, thresh: 15)
      expect(status).to eq(200)
      value = JSON.parse(response_body)['values'][0]
      expect(value['thresh']).to eq(15)
    end

    example "Getting a specific indicator without thresh", document: false do
      do_request(id: 3)
      expect(status).to eq(200)
      value = JSON.parse(response_body)['values'][0]
      expect(value['thresh']).to eq(25)
    end
  end

  get "/api/indicators/:id" do
    parameter :id, "ID of indicator"
    parameter :iso, "ISO of country (bra, chn...)"
    parameter :area, "Value 'pra' for Protected Area"
    parameter :thresh, "Allowed values for thresh: 10, 15, 20, 25, 30, 50, 75"

    example_request "Getting a specific indicator for country", id: 1, iso: 'bra', thresh: 10 do
      expect(status).to eq(200)
      value = JSON.parse(response_body)['values'][0]

      expect(value['iso']).to eq('BRA')
      expect(value['country_name']).to eq('Brazil')
      expect(value['thresh']).to eq(10)
    end

    example "Getting a specific indicator for country with thresh 30", document: false do
      do_request(id: 2, iso: 'guy', thresh: 30)
      expect(status).to eq(200)
      value = JSON.parse(response_body)['values'][0]

      expect(value['iso']).to eq('GUY')
      expect(value['country_name']).to eq('Guyana')
      expect(value['thresh']).to eq(30)
    end

    example "Getting a specific indicator for country without thresh", document: false do
      do_request(id: 3, iso: 'CIV')
      expect(status).to eq(200)
      value = JSON.parse(response_body)['values'][0]

      expect(value['iso']).to eq('CIV')
      expect(value['country_name']).to eq("Cote d'Ivoire")
      expect(value['thresh']).to eq(25)
    end

    example "Getting a specific indicator for protected area without thresh", document: false do
      do_request(id: 3, iso: 'BRA', area: 'pra')
      expect(status).to eq(200)
      value = JSON.parse(response_body)['values'][0]
      
      expect(value['iso']).to eq('BRA')
      expect(value['country_name']).to eq("Brazil")
      expect(value['thresh']).to eq(25)
      expect(value['boundary']).to eq('pra')
    end
  end

  get "/api/indicators/:id/:iso/:id_1" do
    parameter :id, "ID of indicator"
    parameter :iso, "ISO of country (bra, chn...)"
    parameter :id_1, "ID of jurisdiction"
    parameter :thresh, "Allowed values for thresh: 10, 15, 20, 25, 30, 50, 75"

    example_request "Getting a specific indicator for jurisdiction", id: 1, iso: 'bra', id_1: 1, thresh: 10 do
      expect(status).to eq(200)
      value = JSON.parse(response_body)['values'][0]

      expect(value['iso']).to eq('BRA')
      expect(value['country_name']).to eq('Brazil')
      expect(value['thresh']).to eq(10)
      expect(value['boundary']).to eq('admin')
      expect(value['iso_and_sub_nat']).to eq('BRA1')
    end
  end
end
