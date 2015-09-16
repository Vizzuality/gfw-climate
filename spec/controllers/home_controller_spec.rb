require 'rails_helper'

RSpec.describe HomeController, type: :controller do

  context "Homepage" do

    # it "GET index returns http redirect to accept_terms_path" do
    #   get :index
    #   expect(response).to redirect_to accept_terms_path
    #   expect(response).to have_http_status(302)
    # end

    it "GET index returns http success after accepting cookie" do
      # set_cookie
      get :index
      expect(response).to be_success
      expect(response).to have_http_status(200)
    end

  end

end