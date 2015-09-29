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
      'change select' : '_selectCountry'
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

    _getActiveCountries: function() {
      return _.where(this.collection.toJSON().countries, { 'enabled' : true });
    },

    render: function() {
      var countries = this._getActiveCountries();
      this.$el.html(this.template({'countries': countries}))
      // this._invokeChosen();
      this._stopSpinner();
    },

    _stopSpinner: function() {
      this.$el.removeClass('is-loading');
    },

    /*
     * Set selectors values with url arriving from url.
     */
    setValuesFromUrl: function(data) {
      this.collection = data;

      $.when.apply($, this.render()).done(function() {
        this._setUrlValues();
      }.bind(this));
    },

    _setUrlValues: function() {
      var selectors = ['country1', 'country2', 'country3'];
      var self = this;

      $.each(selectors, function(index, value) {
        var country = self.presenter.status.get(value);
        var selector = '#' + value;

        if (country !== null)  {
          $(selector).val(country);
          $(selector).removeClass('is-disabled');
        }
      })

      this._disableOptions();
      this.enableComparisonBtn();
    },

    _selectCountry: function(e) {
      var selector = $(e.currentTarget).attr('id');
      var selectedCountry = $(e.currentTarget).val();

      if (selectedCountry !== 'no_country') {
        this._countrySelected(selectedCountry, selector);
      }
    },

    _countrySelected: function(country, selector) {
      this._updateStatus(country, selector);
      this._enableNextSelector(selector);
      this._disableOptions();
      this.enableComparisonBtn();
    },

    _enableNextSelector: function(selector) {
      if (selector !== 'country3') {
        console.log($('#' + selector).parent());
        $('#' + selector).parent().next().find('selector').removaClass('is-disabled');
      }
    },

    _disableOptions: function() {
      this.$el.find('option').removeClass('is-disabled');

      var selectors = ['country1', 'country2', 'country3'];
      var self = this;

      $.each(selectors, function(index, value) {
        var countries = ['country1', 'country2', 'country3'];
        var index = countries.indexOf(value);

        if (index > -1) {
          countries.splice(index, 1);
        }

        var country = self.presenter.status.get(value);

        if (country !== 'no_country') {
          $.each(countries, function(index, value) {
            $('#' + value).find('[value='+ country +']').addClass('is-disabled');
          })
        }
      })
    },

    _updateStatus: function(country, selector) {
      this.presenter.updateStatus(selector, country);
    },

    enableComparisonBtn: function() {
      //Maybe easier way?
      var selectors = ['country1', 'country2', 'country3'];
      var values = [];
      var self = this;
      var $button = this.$el.find('.btn-compare');

      $.each(selectors, function(index, value) {
        var country = self.presenter.status.get(value);

        if (country !== null && country !== 'no_country') {
          values.push(country)
        }
      })

      if (values.length > 1) {
        $button.removeClass('is-disabled');
      } else {
        $button.addClass('is-disabled');
      }
    },

    _invokeChosen: function() {
      var countrySelectors = ['#country1', '#country2', '#country3'];
      for(var i = 0; i < countrySelectors.length; i++) {
        $(countrySelectors[i]).chosen();
      }
    }

  });

  return CompareSelectorsView;

});
