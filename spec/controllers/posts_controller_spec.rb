require 'rails_helper'

RSpec.describe PostsController, type: :controller do

  # ToDo: Blog feature pending on deliverance
  # context "Posts page" do

  #   render_views

  #   it "GET index returns http success after accepting cookie" do
  #     get :index
  #     expect(response).to be_success
  #     expect(response).to have_http_status(200)
  #   end

  #   it "GET cached posts page", type: :feature do
  #     get :index
  #     expect(response).to be_success
  #     expect($redis.exists('posts_all_1')).to eq(true)
  #   end

  # end

  # context "Post page" do

  #   render_views

  #   it "GET show returns http success after accepting cookie" do
  #     get :show, id: '2015/07/gfw-user-profile-andrew-heald'
  #     expect(response).to be_success
  #     expect(response).to have_http_status(200)
  #     expect(response.body).to match 'GFW User Profile:'
  #   end

  #   it "GET cached post certain page", type: :feature do
  #     get :show, id: '2015/07/gfw-user-profile-andrew-heald'
  #     expect(response).to be_success
  #     expect($redis.exists('post/item_2015/07/gfw-user-profile-andrew-heald')).to eq(true)
  #   end

  # end

end
