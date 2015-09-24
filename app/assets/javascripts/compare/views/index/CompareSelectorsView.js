define([
  'backbone',
  'handlebars',
  'compare/presenters/CompareSelectorsPresenter',
  'compare/collections/CountriesCollection',
  'text!compare/templates/compareSelectorTpl.handlebars'
], function(Backbone, Handlebars, CompareSelectorsPresenter, CountriesCollection, tpl) {

  var CompareSelectorsView = Backbone.View.extend({

    el: '#compareSelectorsView',

    collection: CountriesCollection,

    template: Handlebars.compile(tpl),

    status: new (Backbone.Model.extend({
    })),

    initialize:function() {
      this.presenter = new CompareSelectorsPresenter(this);

      this._setListeners();
      this._cacheVars();

      // Fetching data
      var complete = _.invoke([
        this.collection,
      ], 'fetch');

      $.when.apply($, complete).done(function() {
        this.render();
      }.bind(this));

    },

    _setListeners: function() {
    },

    _cacheVars: function() {
    },

    getActiveCountries: function() {
      return _.where(this.collection.toJSON().countries, { 'enabled' : true });
    },

    render: function() {
      var countries = this.getActiveCountries();
      this.$el.html(this.template({'countries': countries}))

      this.stopSpinner();
    },

    stopSpinner: function() {
      this.$el.removeClass('is-loading');
    }

  });

  return CompareSelectorsView;

});
