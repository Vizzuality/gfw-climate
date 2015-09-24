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

    events: {
      'change select' : '_selectCountry'
    },

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

    _getActiveCountries: function() {
      return _.where(this.collection.toJSON().countries, { 'enabled' : true });
    },

    render: function() {
      var countries = this._getActiveCountries();
      this.$el.html(this.template({'countries': countries}))

      this._stopSpinner();
    },

    _stopSpinner: function() {
      this.$el.removeClass('is-loading');
    },

    _selectCountry: function(e) {
      var country = $(e.currentTarget).val();
      console.log(country)
    }

  });

  return CompareSelectorsView;

});
