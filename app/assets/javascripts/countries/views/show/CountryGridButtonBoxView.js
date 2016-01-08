define([
  'backbone',
  'handlebars',
  'countries/presenters/show/CountryGridButtonBoxPresenter',
  'text!countries/templates/countryGridButtonBox.handlebars',
], function(Backbone, Handlebars, CountryGridButtonBoxPresenter, tpl) {

  var CountryGridButtonBoxView = Backbone.View.extend({

    el: '#countryGridButtonBox',

    template: Handlebars.compile(tpl),

    events: {
      'click .addIndicators' : 'showIndicatorModal'
    },

    initialize:function() {
      this.presenter = new CountryGridButtonBoxPresenter(this);
      this.render();
    },

    render: function() {
      this.$el.html(this.template());
    },

    // Events
    showIndicatorModal: function(e) {
      ga('send', 'event','customise','country page');
      e && e.preventDefault();
      this.presenter.showIndicatorModal();
    }

  });

  return CountryGridButtonBoxView;

});
