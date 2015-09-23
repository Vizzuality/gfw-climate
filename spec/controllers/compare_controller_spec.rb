require 'rails_helper'

RSpec.describe CompareController, type: :controller do

  context "Compare Countries" do

    it "Get compare countries page", type: :feature do
      # set_cookie
      get :index
      expect(response).to be_success
      expect(response).to have_http_status(200)
    end

  end

end
