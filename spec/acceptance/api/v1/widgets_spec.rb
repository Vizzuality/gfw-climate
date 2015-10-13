require 'acceptance_helper'

resource 'Widgets' do
  header "Accept", "application/json; application/gfwc-v1+json"
  header "Content-Type", "application/json"
  header 'Host', 'gfwc-staging.herokuapp.com'

  get "/api/widgets" do
    example_request "Getting a list of enabled widgets" do
      expect(status).to eq(200)
      widgets = JSON.parse(response_body)['widgets']

      expect(widgets.length).to eq(6)
    end
  end

  get "/api/widgets/:id" do
    parameter :iso, "Country iso"
    parameter :id_1, "Jurisdiction id"
    parameter :thresh, "Allowed values for thresh: 10, 15, 20, 25, 30, 50, 75"

    example_request "Getting a specific widget by id for a country", id: 1, iso: 'aus' do
      expect(status).to eq(200)
      widget = JSON.parse(response_body)['widget']
      
      expect(widget['indicators'][0]['data']).to eq('/api/indicators/1/aus')
      expect(widget['indicators'][2]['data']).to eq('/api/countries/aus')
    end

    example_request "Getting a specific widget by id for a juridiction", id: 1, iso: 'aus', id_1: 1 do
      expect(status).to eq(200)
      widget = JSON.parse(response_body)['widget']
      
      expect(widget['indicators'][0]['data']).to eq('/api/indicators/1/aus/1')
      expect(widget['indicators'][2]['data']).to eq('/api/countries/aus/1')
    end

    example_request "Getting a specific widget by id for a juridiction and thresh", id: 1, iso: 'aus', id_1: 1, thresh: 15 do
      expect(status).to eq(200)
      widget = JSON.parse(response_body)['widget']
      
      expect(widget['indicators'][0]['data']).to eq('/api/indicators/1/aus/1?thresh=15')
      expect(widget['indicators'][2]['data']).to eq('/api/countries/aus/1?thresh=15')
    end
  end

end