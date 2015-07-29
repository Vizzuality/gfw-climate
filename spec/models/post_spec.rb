require "rails_helper"

RSpec.describe Post, type: :model do

  context "Get list of posts" do

    it "Find all posts on page one" do
      posts = Post.find_all(page: nil)
      expect(posts.count).to eq 10
    end

    it "Find all posts on page ten" do
      posts = Post.find_all(page: '10')
      expect(posts.count).to eq 10
    end

  end

  context "Get certain post" do

    it "Find post by link" do
      post = Post.find_post('2015/07/gfw-user-profile-andrew-heald')
      expect(post).not_to be_nil
    end

  end

end