require 'rails_helper'

RSpec.describe CountriesController, type: :controller do

  context "Countries page" do

    render_views

    it "GET index returns http redirect to accept_terms_path" do
      get :index
      expect(response).to redirect_to accept_terms_path
      expect(response).to have_http_status(302)
    end

    it "GET index returns http success after accepting cookie" do
      set_cookie
      get :index
      expect(response).to be_success
      expect(response).to have_http_status(200)
      expect(response.body).to match 'Afghanistan'
    end

    it "GET cached countries page", type: :feature do
      set_cookie
      expect($redis.set('countries_all_/', 'items')).to eq('OK')
      expect($redis.exists('countries_all_/')).to eq(true)
      get :index
      expect(response).to be_success
      expect($redis.get('countries_all_/')).to match 'items'
      expect(response).to have_http_status(200)
      expect(response.body).to match 'Afghanistan'
    end

  end

  context "Country page" do

    render_views

    it "GET show returns http redirect to accept_terms_path" do
      get :show, id: 'bra'
      expect(response).to redirect_to accept_terms_path
      expect(response).to have_http_status(302)
    end

    it "GET show returns http success after accepting cookie" do
      set_cookie
      get :show, id: 'bra'
      expect(response).to be_success
      expect(response).to have_http_status(200)
    end

    it "GET cached certain country page", type: :feature do
      set_cookie
      expect($redis.set('country/item_bra_', 'item')).to eq('OK')
      expect($redis.exists('country/item_bra_')).to eq(true)
      get :show, id: 'BRA'
      expect(response).to be_success
      expect($redis.get('country/item_bra_')).to match 'item'
      expect(response).to have_http_status(200)
      expect(response.body).to match 'Afghanistan'
    end

  end

end
