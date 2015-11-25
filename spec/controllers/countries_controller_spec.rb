require 'rails_helper'

RSpec.describe CountriesController, type: :controller do

  context "Countries page" do

    render_views

    it "GET index returns http success after accepting cookie" do
      get :index
      expect(response).to be_success
      expect(response).to have_http_status(200)
    end

    it "GET cached countries page", type: :feature do
      get :index
      expect(response).to be_success
      expect($redis.exists('countries_all_')).to eq(true)
    end

    it "GET pantropical country page" do
      get :pantropical
      expect(response).to be_success
      expect(response).to have_http_status(200)
      expect(response.body).to match 'Carbon Emissions from Tropical Deforestation'
    end

  end

  context "Country page" do

    render_views

    it "GET show returns http success after accepting cookie" do
      get :show, id: 'bra'
      expect(response).to be_success
      expect(response).to have_http_status(200)
      expect(response.body).to match 'Brazil'
    end

    it "GET cached certain country page", type: :feature do
      get :show, id: 'bra'
      expect(response).to be_success
      expect($redis.exists('country/item_bra25')).to eq(true)
    end
  end

end
