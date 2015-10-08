define([
  'backbone',
  'handlebars',
  'chosen',
  'compare/presenters/CompareSelectorsPresenter',
  'text!compare/templates/compareSelectorTpl.handlebars'
], function(Backbone, Handlebars, chosen, CompareSelectorsPresenter, tpl) {

  var CompareSelectorsView = Backbone.View.extend({

    el: '#compareSelectorsView',

    template: Handlebars.compile(tpl),

    events: {
      'click .m-compare-selector' : 'showModal'
    },

    initialize:function() {
      this.presenter = new CompareSelectorsPresenter(this);

      this._setListeners();
      this._cacheVars();
    },

    _setListeners: function() {
    },

    _cacheVars: function() {

    },

    showModal: function(e) {
      this.presenter.showModal($(e.currentTarget).data('tab'));
    }

  });

  return CompareSelectorsView;

});
