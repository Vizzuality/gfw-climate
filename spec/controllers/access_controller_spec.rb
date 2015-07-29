require 'rails_helper'

RSpec.describe AccessController, type: :controller do

  context "Accept terms" do

    it "Post accept_and_redirect returns http redirect to homepage" do
      post :accept_and_redirect
      expect(response).to redirect_to root_path
      expect(response).to have_http_status(302)
    end

    it "Post accept_and_redirect returns http redirect after accepting cookie" do
      set_cookie
      get :accept_and_redirect
      expect(response).to redirect_to root_path
      expect(response).to have_http_status(302)
    end

  end

end
