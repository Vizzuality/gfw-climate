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
      var selector = $(e.currentTarget).attr('id');
      var selectedCountry = $(e.currentTarget).val();

      this.countrySelected(selectedCountry, selector);
    },

    countrySelected: function(country, selector) {
      this._updateStatus(country, selector);
      this._disableSelectors(country, selector);
    },

    _disableSelectors: function(country, selector) {
      var selectors = ['country1', 'country2', 'country3'];
      var index = selectors.indexOf(selector);

      if (index > -1) {
        selectors.splice(index, 1);
      }

      $.each(selectors, function(index, value) {
        $('#' + value).find('option').removeClass('is-disabled');
        $('#' + value).find('[value='+ country +']').addClass('is-disabled');
      })
    },

    _updateStatus: function(country, selector) {
      this.presenter.countrySelected(selector, country);
    }



  });

  return CompareSelectorsView;

});
