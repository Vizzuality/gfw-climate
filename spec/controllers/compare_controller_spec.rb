require 'rails_helper'

RSpec.describe CompareController, type: :controller do

  context "Compare Countries" do

    render_views

    it "Get compare countries page", type: :feature do
      # set_cookie
      get :index
      expect(response).to be_success
      expect(response).to have_http_status(200)
      expect(response.body).to match 'Compare countries'
    end

  end

end
