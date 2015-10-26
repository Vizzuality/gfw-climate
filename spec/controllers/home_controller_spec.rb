require 'rails_helper'

RSpec.describe HomeController, type: :controller do

  context "Homepage" do

    it "GET index returns http success after accepting cookie" do
      get :index
      expect(response).to be_success
      expect(response).to have_http_status(200)
    end

  end

end