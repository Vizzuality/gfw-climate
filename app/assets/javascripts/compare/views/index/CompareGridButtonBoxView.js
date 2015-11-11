define([
  'backbone',
  'compare/presenters/CompareGridButtonBoxPresenter',
  'text!compare/templates/compareGridButtonBox.handlebars',
], function(Backbone, CompareGridButtonBoxPresenter, tpl) {

  var CompareGridButtonBoxView = Backbone.View.extend({

    el: '#compareGridButtonBox',

    template: Handlebars.compile(tpl),

    events: {
      'click .addIndicators' : 'showIndicatorModal'
    },

    initialize:function() {
      this.presenter = new CompareGridButtonBoxPresenter(this);
      this.render();
    },

    render: function() {
      this.$el.html(this.template());
    },

    // Events
    showIndicatorModal: function(e) {
      e && e.preventDefault();
      this.presenter.showIndicatorModal();
    }

  });

  return CompareGridButtonBoxView;

});
