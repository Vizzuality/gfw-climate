require 'acceptance_helper'

resource 'Widgets' do
  header "Accept", "application/json; application/gfwc-v1+json"
  header "Content-Type", "application/json"
  header 'Host', 'gfwc-staging.herokuapp.com'

  get "/api/widgets" do
    parameter :iso, "Country iso"
    parameter :id_1, "Jurisdiction id"
    parameter :thresh, "Allowed values for thresh: 10, 15, 20, 25, 30, 50, 75"
    parameter :default, "Filter widgets by default true or false"

    example_request "Getting a list of widgets" do
      expect(status).to eq(200)
      widgets = JSON.parse(response_body)['widgets']

      expect(widgets.length).to eq(14)
    end

    example "Getting a list of widgets for country" do
      do_request(iso: 'aus')
      expect(status).to eq(200)
      widgets = JSON.parse(response_body)['widgets']

      expect(widgets.length).to eq(14)
    end

    example "Getting a list of widgets for jurisdiction" do
      do_request(iso: 'aus', id_1: 5, thresh: 50)
      expect(status).to eq(200)
      widgets = JSON.parse(response_body)['widgets']

      expect(widgets.length).to eq(14)
      expect(widgets[0]['data']).to eq('/api/widgets/1/aus/5?thresh=50')
    end

    example "Getting a list of widgets for country filtered by default true" do
      do_request(iso: 'aus', default: true)
      expect(status).to eq(200)
      widgets = JSON.parse(response_body)['widgets']

      expect(widgets.length).to eq(6)
      expect(widgets[0]['data']).to eq('/api/widgets/1/aus')
      expect(widgets[0]['tabs'].count).to eq(1)
      expect(widgets[0]['tabs'][0]['default']).to eq(true)
      expect(widgets[0]['indicators'].length).to eq(1)
      expect(widgets[0]['indicators'][0]['default']).to eq(true)
    end

    example "Getting a list of widgets for country filtered by default false" do
      do_request(default: false)
      expect(status).to eq(200)
      widgets = JSON.parse(response_body)['widgets']

      expect(widgets.length).to eq(8)
      expect(widgets[0]['data']).to eq('/api/widgets/7')
    end
  end

  get "/api/widgets/:id" do
    parameter :iso, "Country iso"
    parameter :id_1, "Jurisdiction id"
    parameter :thresh, "Allowed values for thresh: 10, 15, 20, 25, 30, 50, 75"

    example_request "Getting a specific widget by id for a country", id: 1, iso: 'aus' do
      expect(status).to eq(200)
      widget = JSON.parse(response_body)['widget']

      expect(widget['tabs'][0]['position']).to eq(1)
      expect(widget['tabs'][0]['default']).to eq(true)
      expect(widget['tabs'][0]['switch'].length).to eq(2)
      expect(widget['tabs'][0]['switch'][0]['unit']).to eq('hectares')
      expect(widget['indicators'][0]['data']).to eq('/api/indicators/1/aus')
      expect(widget['indicators'][2]['data']).to eq('/api/indicators/15/aus')
      expect(widget['indicators'][0]['tab']).to eq(1)
      expect(widget['indicators'][0]['default']).to eq(true)
    end

    example_request "Getting a specific widget by id for a juridiction", id: 1, iso: 'aus', id_1: 1 do
      expect(status).to eq(200)
      widget = JSON.parse(response_body)['widget']

      expect(widget['indicators'][0]['data']).to eq('/api/indicators/1/aus/1')
      expect(widget['indicators'][2]['data']).to eq('/api/indicators/15/aus/1')
    end

    example_request "Getting a specific widget by id for a juridiction and thresh", id: 1, iso: 'aus', id_1: 1, thresh: 15 do
      expect(status).to eq(200)
      widget = JSON.parse(response_body)['widget']

      expect(widget['tabs'][2]['position']).to eq(3)
      expect(widget['indicators'][0]['data']).to eq('/api/indicators/1/aus/1?thresh=15')
      expect(widget['indicators'][2]['data']).to eq('/api/indicators/15/aus/1?thresh=15')
    end
  end

end
