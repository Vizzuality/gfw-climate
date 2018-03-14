define(
  [
    'backbone',
    'mps',
    'compare/collections/CountriesCollection',
    'compare/models/CountryModel',
    'compare/presenters/PresenterClass'
  ],
  function(Backbone, mps, CountriesCollection, CountryModel, PresenterClass) {
    'use strict';

    var CompareSelectorsPresenter = PresenterClass.extend({
      status: new (Backbone.Model.extend({
        defaults: {
          name: 'compare-countries',
          tab: '1'
        }
      }))(),

      init: function(view) {
        this._super();
        this.view = view;
        this.setListeners();
        mps.publish('Place/register', [this]);
      },

      setListeners: function() {
        this.status.on(
          'change:compare1 change:compare2',
          this.changeCompare,
          this
        );
        this.status.on(
          'change:compare1',
          function(model, compare) {
            this.view.setCompare(1, compare);
            !!model.get('compare2')
              ? this.view.setCompare(2, model.get('compare2'))
              : null;
          },
          this
        );
        this.status.on(
          'change:compare2',
          function(model, compare) {
            !!model.get('compare1')
              ? this.view.setCompare(1, model.get('compare1'))
              : null;
            this.view.setCompare(2, compare);
          },
          this
        );

        // Tab
        this.status.on(
          'change:tab',
          function(model, tab) {
            this.view.setTab();
          },
          this
        );
      },

      /**
       * Application subscriptions.
       */
      _subscriptions: [
        {
          'Place/go': function(params) {
            this._onPlaceGo(params);
          },
          'CompareModal/show': function(tab) {
            this.changeTab(tab);
            this.view.show();
          }
        }
      ],

      /**
       * Used by PlaceService to get the current iso/area params.
       *
       * @return {object} iso/area params
       */
      getPlaceParams: function() {
        var p = {};
        p.compare1 = this.status.get('compare1');
        p.compare2 = this.status.get('compare2');
        return p;
      },

      /**
       * Triggered from 'Place/Go' events.
       *
       * @param  {Object} params PlaceService's params object
       */
      _onPlaceGo: function(params) {
        if (!!params.compare1 && !!params.compare2) {
          // Fetching data
          var complete = _.invoke(
            [
              new CountriesCollection(),
              new CountryModel({ id: params.compare1.iso }),
              new CountryModel({ id: params.compare2.iso })
            ],
            'fetch'
          );

          $.when.apply($, complete).done(
            function(_countries, _country1, _country2) {
              // Set model for render
              this.status.set('countries', _countries[0].countries);
              this.status.set('country1', _country1[0].country);
              this.status.set('country2', _country2[0].country);
              this.view.render();
              // Set model for compare selects
              this.status.set('compare1', params.compare1);
              this.status.set('compare2', params.compare2);

              // console.log(this.status.get('country1'));
            }.bind(this)
          );
        } else {
          // Fetching data
          var complete = _.invoke([new CountriesCollection()], 'fetch');

          $.when.apply($, complete).done(
            function(_countries) {
              // Set model for render
              this.status.set('countries', _countries.countries);
              this.view.render();
            }.bind(this)
          );
        }
      },

      /*
      CHANGERS: Change values events
      - changeTab
      - changeIso
      - changeJurisdiction
      - changeArea
      - changeSelection
    */
      changeIso: function(val) {
        var select = this.status.get('tab');
        if (!!val) {
          // Fetching data
          var complete = _.invoke([new CountryModel({ id: val })], 'fetch');

          $.when.apply($, complete).done(
            function(_country) {
              // Set model for render
              this.status.set('country' + select, _country.country);
              this.view.render();
              // Set model for compare selects
              this.status.set('compare' + select, {
                iso: val,
                area: 0,
                jurisdiction: 0
              });
            }.bind(this)
          );
        } else {
          this.status.set('country' + select, null);
          this.view.render();
          this.status.set('compare' + select, false);
        }
      },

      changeJurisdiction: function(val) {
        var select = this.status.get('tab');
        var compare = this.status.get('compare' + select);
        this.status.set('compare' + select, {
          iso: compare.iso,
          area: 0,
          jurisdiction: val
        });
      },

      changeArea: function(val) {
        var select = this.status.get('tab');
        var compare = this.status.get('compare' + select);
        this.status.set('compare' + select, {
          iso: compare.iso,
          area: val,
          jurisdiction: 0
        });
      },

      changeTab: function(tab) {
        this.status.set('tab', tab);
      },

      changeCompare: function() {
        mps.publish('Place/update');
      },

      changeSelection: function() {
        var place = {};

        place.compare1 = this.status.get('compare1');
        place.compare2 = this.status.get('compare2');
        place.name = this.status.get('name');

        mps.publish('Compare/update', [place]);
        //This event, thrown when two countries selected,
        //has to be listen by:
        //mainView, to draw graphics and
        //selectorsView to draw countries figures
      }
    });

    return CompareSelectorsPresenter;
  }
);
