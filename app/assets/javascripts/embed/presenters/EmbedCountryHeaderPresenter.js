define(
  [
    'mps',
    'backbone',
    'embed/presenters/PresenterClass',
    'embed/models/CountryModel',
    'widgets/models/WidgetModel'
  ],
  function(mps, Backbone, PresenterClass, CountryModel, WidgetModel) {
    'use strict';

    var EmbedCountryHeaderPresenter = PresenterClass.extend({
      status: new (Backbone.Model.extend({}))(),

      init: function(view) {
        this._super();
        this.view = view;
        mps.publish('Place/register', [this]);
      },

      /**
       * Used by PlaceService to get the current iso/area params.
       *
       * @return {object} iso/area params
       */
      getPlaceParams: function() {
        var p = {};
        return p;
      },

      /**
       * Application subscriptions.
       */
      _subscriptions: [
        {
          'Place/go': function(params) {
            this.status.set(params);
            this.placeGo(params);
          }
        }
      ],

      /**
       * Place GO
       */

      placeGo: function(params) {
        var location = this.status.get('location');
        var widget = this.status.get('widget');

        if (!!location) {
          // Initialize both models
          var countryModel = new CountryModel({ iso: location.iso });
          var widgetModel = new WidgetModel({ id: widget, location: location });

          //call fetch and keep their promises
          var complete = _.invoke([countryModel, widgetModel], 'fetch');

          //when all of them are complete...
          $.when.apply($, complete).done(
            function(response) {
              //all ready and good to go...
              var country = countryModel.toJSON();
              var widget = widgetModel.toJSON();
              var title = this.setCountryTitle(location, country);
              var subtitle = this.setCountrySubtitle(location, country);

              this.status.set('widgetName', widget.name);
              this.status.set('widgetSlug', widget.slug);
              this.status.set('title', title);
              this.status.set('subtitle', subtitle);

              this.view.render();
            }.bind(this)
          );
        }
      },

      setCountryTitle: function(location, country) {
        if (!!~~location.jurisdiction) {
          var jurisdiction = _.findWhere(country.jurisdictions, {
            id: ~~location.jurisdiction
          });
          return jurisdiction.name;
        } else if (!!~~location.area) {
          var area = _.findWhere(country.areas_of_interest, {
            id: ~~location.area
          });
          return area.name;
        } else {
          return country.name;
        }

        return country.name;
      },

      setCountrySubtitle: function(location, country) {
        if (!!~~location.jurisdiction) {
          return country.name;
        } else if (!!~~location.area) {
          return country.name;
        } else {
          return null;
        }

        return null;
      }
    });

    return EmbedCountryHeaderPresenter;
  }
);
