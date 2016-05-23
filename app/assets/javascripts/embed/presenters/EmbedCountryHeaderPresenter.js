define([
  'mps',
  'backbone',
  'embed/presenters/PresenterClass',
  'embed/models/CountryModel',
  'widgets/models/WidgetModel',

], function(mps, Backbone, PresenterClass, CountryModel, WidgetModel) {

  'use strict';

  var EmbedCountryHeaderPresenter = PresenterClass.extend({

    status: new (Backbone.Model.extend({})),

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
    _subscriptions: [{
      'Place/go': function(params) {
        this.status.set(params);
        this.placeGo(params);
      }
    }],


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
        $.when.apply($, complete).done(function(response) {
          //all ready and good to go...
          var country = countryModel.toJSON();
          var widget = widgetModel.toJSON();

          this.status.set('widgetName', widget.name);
          this.status.set('widgetSlug', widget.slug);
          this.status.set('countryName', country.name);
          this.status.set('jurisdictionName', _.findWhere(country.jurisdictions, {id: location.jurisdiction }));
          this.status.set('areaName', _.findWhere(country.areas_of_interest, {id: location.jurisdiction }));

          this.view.render();

        }.bind(this));
      }
    },

  });

  return EmbedCountryHeaderPresenter;

});
