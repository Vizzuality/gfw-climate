require 'rails_helper'

RSpec.describe StaticController, type: :controller do

  context "Terms page" do

    it "GET terms returns http redirect to accept_terms_path" do
      get :terms
      expect(response).to redirect_to accept_terms_path
      expect(response).to have_http_status(302)
    end

    it "GET terms returns http success after accepting cookie" do
      set_cookie
      get :terms
      expect(response).to be_success
      expect(response).to have_http_status(200)
    end

  end

  context "About page" do

    it "GET about returns http redirect to accept_terms_path" do
      get :about
      expect(response).to redirect_to accept_terms_path
      expect(response).to have_http_status(302)
    end

    it "GET about returns http success after accepting cookie" do
      set_cookie
      get :about
      expect(response).to be_success
      expect(response).to have_http_status(200)
    end

  end

  context "Accept terms page" do

    it "GET accept terms returns http success" do
      get :accept_terms
      expect(response).to be_success
      expect(response).to have_http_status(200)
    end

    it "GET accept terms returns http redirect to homepage" do
      set_cookie
      get :accept_terms
      expect(response).to redirect_to root_path
      expect(response).to have_http_status(302)
    end

  end

end
