/**
 * The CountriesView selector view.
 *
 * @return CountriesView instance (extends Backbone.View).
 */

define(
  [
    'underscore',
    'handlebars',
    'enquire',
    'amplify',
    'chosen',
    'services/CountryService',
    'map/presenters/tabs/CountriesPresenter',
    'map/views/GeoStylingView',
    'widgets/indicators/bars/BarChart',
    'text!map/templates/tabs/countries.handlebars',
    'text!map/templates/tabs/countriesIso.handlebars',
    'text!map/templates/tabs/countriesButtons.handlebars',
    'text!map/templates/tabs/countries-mobile.handlebars'
  ],
  function(
    _,
    Handlebars,
    enquire,
    amplify,
    chosen,
    CountryService,
    Presenter,
    GeoStylingView,
    barChart,
    tpl,
    tplIso,
    tplButtons,
    tplMobile
  ) {
    'use strict';

    var CountriesModel = Backbone.Model.extend({
      defaults: {
        country_layers: null
      }
    });

    var CountriesView = Backbone.View.extend({
      el: '#countries-tab',

      template: Handlebars.compile(tpl),
      templateIso: Handlebars.compile(tplIso),
      templateButtons: Handlebars.compile(tplButtons),
      templateMobile: Handlebars.compile(tplMobile),

      events: {
        //countries
        'click .layer': 'toggleLayer',
        'click .wrapped-layer': 'toggleLayerWrap',

        'click #countries-analyze-button': 'analyzeIso',
        'change #countries-country-select': 'changeIso',

        'click #countries-country-ul li': 'changeIsoMobile',
        'click #countries-country-reset': 'changeIsoMobile',

        'click #countries-letters-ul li': 'setLetter'
      },

      initialize: function(map) {
        this.embed = $('body').hasClass('is-embed-action');
        this.map = map;
        this.model = new CountriesModel();
        this.presenter = new Presenter(this);
        this.barChart = barChart;
        this.geoStyles = new GeoStylingView();

        enquire.register(
          'screen and (min-width:' + window.gfw.config.GFW_MOBILE + 'px)',
          {
            match: _.bind(function() {
              this.mobile = false;
              this.render();
            }, this)
          }
        );
        enquire.register(
          'screen and (max-width:' + window.gfw.config.GFW_MOBILE + 'px)',
          {
            match: _.bind(function() {
              this.mobile = true;
              this.renderMobile();
            }, this)
          }
        );

        this.cacheVars();
        //Experiment
        this.presenter.initExperiment('source');
      },

      render: function() {
        this.$el.html(this.template());
      },
      renderMobile: function() {
        this.$el.html(this.templateMobile());
      },

      cacheVars: function() {
        //toggle-countries-content
        this.$toggle = $('#toggle-countries-content');
        //buttons
        this.$buttons = $('#countries-buttons');
        //layers
        this.$layers = $('#countries-layers');

        //country
        this.$selects = this.$el.find('.chosen-select');
        this.$countrySelect = $('#countries-country-select');
        this.$countryUl = $('#countries-country-ul');
        this.$countryReset = $('#countries-country-reset');
        this.$countryBack = $('#country-tab-mobile-btn-back');
        this.$countryName = $('#countries-name');
        this.$letters = $('#countries-letters-ul');
        this.inits();
      },

      inits: function() {
        // countries
        this.getCountries();
        if (!this.embed) {
          setTimeout(
            _.bind(function() {
              this.presenter.openTab('#countries-tab-button');
            }, this),
            0
          );
        }
        this.$countryReset.on('click', _.bind(this.changeIsoMobile, this));
      },

      /**
       * Set geojson style.
       */
      setStyle: function(opacity) {
        this.style = this.geoStyles.getStyles('country');
      },

      getIsoLayers: function(layers) {
        this.isoLayers = layers;
      },

      setIsoLayers: function() {
        var layersToRender = [];
        _.each(
          this.isoLayers,
          _.bind(function(layer) {
            if (layer.iso === this.iso) {
              layersToRender.push(layer);
            }
          }, this)
        );
        this.renderIsoLayer(layersToRender);
      },

      renderIsoLayer: function(layersToRender) {
        this.$layers.html(
          this.templateIso({ iso: this.iso, layers: layersToRender })
        );
        this._renderHtml();
        this._selectSubIsoLayer();
      },

      _renderHtml: function() {
        this.$layers
          .find('.layers-list')
          .html($('#country-layers .layers-list').html());
      },

      _selectSubIsoLayer: function() {
        var parentSelected = this.$layers
          .find('.layer:first')
          .hasClass('selected');
        var subLayersSelected =
          this.$layers.find('.wrapped.selected').length > 0;
        if (!subLayersSelected && parentSelected) {
          this.$layers.find('.wrapped:first').click();
        }
      },

      toggleLayer: function(event) {
        // event.stopPropagation();
        event.preventDefault();

        if (
          !$(event.target).hasClass('source') &&
          !$(event.target)
            .parent()
            .hasClass('source')
        ) {
          var $li = $(event.currentTarget);
          var layerSlug = $li.data('layer');
          var layer = _.where(this.isoLayers, { slug: layerSlug })[0];

          if (layer) {
            $('#country-layers [data-layer="' + layerSlug + '"]:first').click();
            ga('send', 'event', 'Map', 'Toggle', 'Layer: ' + layerSlug);
          }
        }
      },

      toggleLayerWrap: function(e) {
        if (
          $(e.target)
            .parent()
            .siblings()
            .hasClass('selected')
        )
          return;
        if (
          !$(e.target).hasClass('source') &&
          !$(e.target)
            .parent()
            .hasClass('source') &&
          !$(e.target).hasClass('layer')
        ) {
          var $li = $(e.currentTarget);
          var layerSlug = $li.data('layer');
          $('#country-layers [data-layer="' + layerSlug + '"]:first').click();
        }
      },

      setButtons: function(to, country) {
        this.$toggle.toggleClass('active', to);
        var isSpecialAtlas =
          (!!country && !!country.iso && country.iso == 'IDN') || false;
        this.$buttons.html(
          this.templateButtons({
            iso: this.iso,
            country: country,
            isSpecialAtlas: isSpecialAtlas
          })
        );
      },

      analyzeIso: function(e) {
        this.presenter.setAnalyze(null);
      },

      /**
       * COUNTRY
       */
      getCountries: function() {
        CountryService.getCountries().then(
          function(countries) {
            this.printCountries(countries);
          }.bind(this)
        );
      },

      /**
       * Print countries.
       */
      printCountries: function(countries) {
        if (this.mobile) {
          var options = '';
          var letters = [];
          _.each(
            _.sortBy(countries, function(country) {
              return country.name;
            }),
            _.bind(function(country, i) {
              var letter = country.name.charAt(0).toUpperCase();
              options +=
                '<li data-value="' +
                country.iso +
                '" data-alpha="' +
                letter +
                '">' +
                country.name +
                '</li>';
              letters.push(letter);
            }, this)
          );
          letters = _.uniq(letters);
          this.$countryUl.html(options);
          this.setLettersVisibility(letters);
        } else {
          //Loop for print options
          var options = '<option></option>';
          _.each(
            _.sortBy(countries, function(country) {
              return country.name;
            }),
            _.bind(function(country, i) {
              options +=
                '<option value="' +
                country.iso +
                '">' +
                country.name +
                '</option>';
            }, this)
          );
          this.$countrySelect.append(options);
          this.$selects.chosen({
            width: '100%',
            allow_single_deselect: true,
            inherit_select_classes: true,
            no_results_text: 'Oops, nothing found!'
          });
        }
      },

      // Please refactor
      setLettersVisibility: function(arr) {
        _.each(
          this.$letters.find('li'),
          _.bind(function(v) {
            var alpha = $(v).data('alpha');
            if (arr.indexOf(alpha) == -1) {
              $(v).addClass('disabled');
            }
          }, this)
        );
      },

      setLetter: function(e) {
        var current = $(e.currentTarget),
          filter;
        if (!current.hasClass('disabled')) {
          if (current.hasClass('current')) {
            this.$letters.find('li').removeClass('current');
            filter = null;
          } else {
            this.$letters.find('li').removeClass('current');
            current.addClass('current');
            filter = current.data('alpha');
          }
          this.filterByLetter(filter);
        }
      },

      filterByLetter: function(filter) {
        this.$countryUl.find('li').filter(function(k, v) {
          if (!!filter) {
            $(v).data('alpha') == filter
              ? $(v).removeClass('hidden')
              : $(v).addClass('hidden');
          } else {
            $(v).removeClass('current hidden');
          }
        });
        !!!filter ? this.$letters.find('li').removeClass('current') : null;
      },

      // Select change iso
      changeIso: function(e) {
        // console.log('changeIso')
        this.iso = $(e.currentTarget).val() || null;
        this.commonIsoChanges();
        this.presenter.changeIso({ country: this.iso, region: null });
      },

      changeIsoMobile: function(e) {
        this.iso = $(e.currentTarget).data('value') || null;
        this.commonIsoChanges();
        this.presenter.changeIso({ country: this.iso, region: null });
      },

      // For autoselect country and region when youn reload page
      setSelects: function(iso) {
        this.iso = iso.country;
        this.commonIsoChanges();
        this.$countrySelect.val(this.iso).trigger('chosen:updated');
        // record event
        var countryName = this.$countrySelect
          .find("option[value='" + this.iso + "']")
          .text();
        ga('send', 'event', 'Map', 'Search', countryName);
        if (this.mobile) {
          this.filterByLetter(null);
        }
      },

      commonIsoChanges: function() {
        this.setIsoLayers();
        this.setButtons(!!this.iso);
        if (this.mobile) {
          var country = _.find(
            amplify.store('countries'),
            _.bind(function(country) {
              return country.iso === this.iso;
            }, this)
          );
          var name = country ? country.name + ' Data' : 'Country Data';
          var shareName = country ? country.name : '';
          this.$countryName.text(name);
          this.presenter.changeNameIso(shareName);
          if (!!this.iso) {
            this.$countryReset.show(0);
            this.$countryBack.hide(0);
            this.$countryUl.addClass('hidden');
            this.$letters.parents('.letters-ul-mobile-box').addClass('hidden');
            this.filterByLetter(null);
          } else {
            this.$countryReset.hide(0);
            this.$countryBack.show(0);
            this.$countryUl.removeClass('hidden');
            this.$letters
              .parents('.letters-ul-mobile-box')
              .removeClass('hidden');
            this.filterByLetter(null);
          }
        }
        this.$countrySelect.val(this.iso).trigger('chosen:updated');
        if (this.iso) {
          this.getAdditionalInfoCountry();
        }
      },

      getAdditionalInfoCountry: function() {
        if (!amplify.store('country-' + this.iso)) {
          $.ajax({
            url: window.gfw.config.GFW_API_HOST + '/countries/' + this.iso,
            dataType: 'json',
            success: _.bind(function(data) {
              amplify.store('country-' + this.iso, data);
              this.setAdditionalInfoCountry();
            }, this),
            error: function(error) {
              console.log(error);
            }
          });
        } else {
          this.setAdditionalInfoCountry();
        }
      },

      setAdditionalInfoCountry: function() {
        var country = amplify.store('country-' + this.iso);
        this.setButtons(!!this.iso, country);
      }
    });

    return CountriesView;
  }
);
