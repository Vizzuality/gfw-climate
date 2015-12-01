require 'rails_helper'

RSpec.describe MapController, type: :controller do

  context "Map page" do

    render_views

    it "GET index returns http redirect to accept_terms_path" do
      get :index
      expect(response).to have_http_status(302)
    end

    it "GET index returns http success after accepting cookie" do
      set_cookie
      get :index
      expect(response).to be_success
      expect(response).to have_http_status(200)
    end

  end

end
