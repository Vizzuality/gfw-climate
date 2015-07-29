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

  end

  context "Country page" do

    render_views

    it "GET show returns http redirect to accept_terms_path" do
      get :show, id: 'AFG'
      expect(response).to redirect_to accept_terms_path
      expect(response).to have_http_status(302)
    end

    it "GET show returns http success after accepting cookie" do
      set_cookie
      get :show, id: 'AFG'
      expect(response).to be_success
      expect(response).to have_http_status(200)
      expect(response.body).to match 'Afghanistan'
    end

  end

end
