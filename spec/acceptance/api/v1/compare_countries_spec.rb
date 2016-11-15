require 'acceptance_helper'

resource 'Compare countries' do
  #header "Accept", "application/json; application/gfwc-v1+json"
  #header "Content-Type", "application/json"
  #header 'Host', 'gfwc-staging.herokuapp.com'

  #get "/api/compare-countries" do
  #  parameter :path, "Allowed path: iso+1+0/iso+1+0/iso+0+3/iso+4/iso/iso+0+0 etc..."

  #  example "Getting a list of countries and jurisdictions for compare" do
  #    do_request(path: 'Bra/aus+1/aut+4+0/guy+0+5')
  #    expect(status).to eq(200)
  #    countries = JSON.parse(response_body)['countries']

  #    expect(countries.length).to eq(4)
  #    expect(countries[0]['name']).to eq('Brazil')
  #    expect(countries[0]['iso']).to eq('BRA')
  #    expect(countries[1]['name']).to eq('Ashmore and Cartier Islands')
  #    expect(countries[1]['iso']).to eq('AUS')
  #    expect(countries[2]['name']).to eq('Oberösterreich')
  #    expect(countries[2]['iso']).to eq('AUT')

  #    # Widgets url's
  #    expect(countries[0]['widgets'].count).to eq(15)
  #    expect(countries[0]['widgets'][0]['data']).to eq('/api/widgets/1/BRA')
  #  end

  #  example "Getting a list of one country and two jurisdictions for compare", document: false do
  #    do_request(path: 'Bra/aus+1+0/aut+4')
  #    expect(status).to eq(200)
  #    countries = JSON.parse(response_body)['countries']

  #    expect(countries.length).to eq(3)
  #    expect(countries[0]['name']).to eq('Brazil')
  #    expect(countries[0]['iso']).to eq('BRA')
  #    expect(countries[1]['name']).to eq('Ashmore and Cartier Islands')
  #    expect(countries[1]['iso']).to eq('AUS')
  #    expect(countries[2]['name']).to eq('Oberösterreich')
  #    expect(countries[2]['iso']).to eq('AUT')
  #  end

  #  example "Getting a list of three countries for compare", document: false do
  #    do_request(path: 'Bra+0+0/aus+0/aut')
  #    expect(status).to eq(200)
  #    countries = JSON.parse(response_body)['countries']

  #    expect(countries.length).to eq(3)
  #    expect(countries[0]['name']).to eq('Brazil')
  #    expect(countries[0]['iso']).to eq('BRA')
  #    expect(countries[1]['name']).to eq('Australia')
  #    expect(countries[1]['iso']).to eq('AUS')
  #    expect(countries[2]['name']).to eq('Austria')
  #    expect(countries[2]['iso']).to eq('AUT')
  #  end

  #  example "Getting a list of two countries for compare", document: false do
  #    do_request(path: 'Bra+0+0/aus+0')
  #    expect(status).to eq(200)
  #    countries = JSON.parse(response_body)['countries']

  #    expect(countries.length).to eq(2)
  #    expect(countries[0]['name']).to eq('Brazil')
  #    expect(countries[0]['iso']).to eq('BRA')
  #    expect(countries[1]['name']).to eq('Australia')
  #    expect(countries[1]['iso']).to eq('AUS')
  #  end

  #  example "Getting a list of one country for compare", document: false do
  #    do_request(path: 'Bra+0+0')
  #    expect(status).to eq(200)
  #    countries = JSON.parse(response_body)['countries']

  #    expect(countries.length).to eq(1)
  #    expect(countries[0]['name']).to eq('Brazil')
  #    expect(countries[0]['iso']).to eq('BRA')
  #  end

  #  example "Getting a list of one country for compare", document: false do
  #    do_request(path: 'Bra/aus+0+1/aut+4+0/gUy+0+0')
  #    expect(status).to eq(200)
  #    countries = JSON.parse(response_body)['countries']

  #    expect(countries.length).to eq(4)
  #    expect(countries[0]['name']).to eq('Brazil')
  #    expect(countries[0]['iso']).to eq('BRA')
  #    expect(countries[1]['name']).to eq('Australia')
  #    expect(countries[1]['iso']).to eq('AUS')
  #    expect(countries[2]['name']).to eq('Oberösterreich')
  #    expect(countries[2]['iso']).to eq('AUT')
  #    expect(countries[3]['name']).to eq('Guyana')
  #    expect(countries[3]['iso']).to eq('GUY')
  #  end
  #end

end
