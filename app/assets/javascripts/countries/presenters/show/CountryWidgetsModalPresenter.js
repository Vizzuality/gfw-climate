define([
  'backbone',
  'mps',
  'countries/presenters/PresenterClass',
  'countries/models/CountryModel',
  'widgets/collections/WidgetCollection',
], function(Backbone, mps, PresenterClass, CountryModel, WidgetCollection) {

  'use strict';

  var CountryModalWidgetsPresenter = PresenterClass.extend({

    status: new (Backbone.Model.extend({})),

    init: function(view) {
      this._super();
      this.view = view;

      this.countryModel;

      mps.publish('Place/register', [this]);
    },

    getPlaceParams: function() {
      var p = {};
      return p;
    },

    /**
     * Application subscriptions.
     */
    _subscriptions: [{

      'Place/go': function(p) {
        var activeWidgetsIds = [],
          jurisdictionsActive = [],
          areasActive = [];

        new WidgetCollection()
          .fetch()
          .done(_.bind(function(response){
            this.status.set('widgets', response.widgets)


            if (!!p.options) {
              activeWidgetsIds = this._toInteger(p.options.activeWidgets);


              if (!!p.options.jurisdictions) {
                jurisdictionsActive = _.map(p.options.jurisdictions, function(j) {
                  return ~~j.idNumber;
                });
              }

              if (!!p.options.areas) {
                areasActive = _.map(p.options.areas, function(a) {
                  return ~~a.idNumber;
                });
              }
            } else {

              var activeWidgets = _.where(this.status.get('widgets'), {default: true});
              activeWidgets.forEach(function(w) {
                activeWidgetsIds.push(w.id)
              });

              jurisdictionsActive = [];
              areasActive = [];
            }

            this.status.set({
              country: p.country.iso,
              view: p.view,
              widgetsActive: activeWidgetsIds,
              jurisdictionsActive: jurisdictionsActive,
              areasActive: areasActive
            });

            this.countryModel = new CountryModel(p.country);

            this.countryModel.fetch().done(_.bind(function() {
              this.view.render();
              this.view.setWidgetsStatus();
              this.view.setJurisdictionStatus();
              this.view.setAreasStatus();
            }, this));

          }, this ));
      },

      'View/update': function(v) {
        this.status.set({
          view: v,
          jurisdictionsActive: [],
          areasActive:[]
        });

        if (v !== 'national') {
          this.status.set('widgetsActive', []);
        } else {
          var activeWidgetsIds = [];
          var activeWidgets = _.where(this.status.get('widgets'), {default: true});
          activeWidgets.forEach(function(w) {
                activeWidgetsIds.push(w.id)
              });
          this.status.set('widgetsActive', activeWidgetsIds);
        }

        this.view.render();
        this.view.setWidgetsStatus();

        // this.view.setJurisdictionStatus();
        // this.view.setAreasStatus();
      },

      'Widgets/update': function(widgets) {
        var view = this.status.get('view');
        switch(view) {
          case 'national':
            this.status.set('widgetsActive', this._toInteger(widgets));
            break;

          case 'subnational':
            this.status.set('jurisdictionsActive', this._toInteger(widgets));
            break;

          case 'areas-interest':
            this.status.set('areasActive', this._toInteger(widgets));
            break;
        }


        this.view.render();
        this.view.setWidgetsStatus();
        this.view.setJurisdictionStatus();
        this.view.setAreasStatus();
      },

      'CountryWidgetsModal/show': function() {
        this.view.show();
      }
    }],

    _toInteger: function(arr) {
      var toInteger = [];
      if (arr) {
        arr.forEach(function(a) {
          toInteger.push(~~a);
        });
      }

      return toInteger;
    },

    changeActiveWidgets: function(widgetId,remove) {
      var widgets = _.clone(this._toInteger(this.status.get('widgetsActive')));
      var view = this.status.get('view');
      (remove) ? widgets = _.without(widgets,widgetId) : widgets.push(widgetId);


      this.status.set('widgetsActive', widgets);
      this.view.setWidgetsStatus();


    },

    changeActiveJurisdictions: function(jurisdictionId, remove) {
      var jurisdictions = _.clone(this._toInteger(this.status.get('jurisdictionsActive')));
      (remove) ? jurisdictions = _.without(jurisdictions,jurisdictionId) : jurisdictions.push(jurisdictionId);
      this.status.set('jurisdictionsActive', jurisdictions);
      this.view.setJurisdictionStatus();
    },

    changeActiveAreas: function(areasId, remove) {
      var areas = _.clone(this._toInteger(this.status.get('areasActive')));
      (remove) ? areas = _.without(areas, areasId) : areas.push(areasId);
      this.status.set('areasActive', areas);
      this.view.setAreasStatus();
    },

    setActiveWidgets: function() {
      mps.publish('Grid/update', [{
        view: this.status.get('view'),
        options: this.status.toJSON(),
        jurisdictions: this.status.get('jurisdictions'),
        areas: this.status.get('areas')
      }]);

      // mps.publish('Grid/update', [{
      //   options: this.presenter.status.toJSON(),
      //   jurisdictions: this.presenter.status.get('jurisdictions'),
      //   areas: this.presenter.status.get('areas'),
      //   view: this.presenter.status.get('view'),
      //   country: sessionStorage.getItem('countryIso')
      // }]);
    }

  });

  return CountryModalWidgetsPresenter;

});
