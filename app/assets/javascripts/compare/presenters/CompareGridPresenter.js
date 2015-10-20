define([
  'backbone',
  'mps',
  'compare/presenters/PresenterClass',
  'compare/services/CompareService',
  'compare/collections/WidgetsCollection',
], function(Backbone, mps, PresenterClass, CompareService, WidgetsCollection) {

  'use strict';

  var CompareGridPresenter = PresenterClass.extend({

    status: new (Backbone.Model.extend({
      defaults: {
        name: 'compare-countries'
      }
    })),

    init: function(view) {
      this._super();
      this.view = view;
      this.service = CompareService;
      this.setListeners();
    },

    setListeners: function() {
      this.status.on('change:compare1 change:compare2', this.changeCompare, this);
      this.status.on('change:data', this.changeData, this);

    },

    /**
     * Application subscriptions.
     */
    _subscriptions: [{
      'Place/go': function(params) {
        this._onPlaceGo(params);
      },

      'Compare/update': function(params) {
        this._onCompareUpdate(params)
      },

    }],

    /**
     *
    */
    _onPlaceGo: function(params) {
      if (! !!params.options) {
        // Fetching data
        new WidgetsCollection()
          .fetch({data: {default: true}})
          .done(_.bind(function(_options){
            params.options = this.getOptions(_options);
            this.setModels(params);
          }, this ));

      } else {
        this.setModels(params);
      }
    },


    _onCompareUpdate: function(params) {
      var params = _.extend({}, this.status.attributes, params);
      if (!!params.compare1 && !!params.compare2) {
        this.setModels(params);
      }
    },

    // SETTER
    setModels: function(params) {
      this.status.set('options', params.options);
      this.status.set('widgets', this.getWidgets());
      this.status.set('compare1', params.compare1);
      this.status.set('compare2', params.compare2);
    },

    // COMPARE EVENTS
    changeData: function() {
      this.view.render();
    },

    changeCompare: function() {
      var compare1 = this.objToUrl(this.status.get('compare1'));
      var compare2 = this.objToUrl(this.status.get('compare2'));
      if (!!compare1 && !!compare2) {
        this.service.execute(
          compare1,
          compare2,
          _.bind(this.successCompare, this),
          _.bind(this.errorCompare, this)
        );
      }
    },

    successCompare: function(data) {
      // var activeWidgets = this.status.get('widgets');
      var activeWidgets = [1,2];
      var data = _.map(data.countries, function(c){
        c.widgets = _.compact(_.map(c.widgets, function(w){
          return (_.contains(activeWidgets, w.id)) ? w : null;
        }));
        return c;
      });
      this.status.set('data', data);
    },

    errorCompare: function() {
      console.log('ERROR');
      console.log(arguments);
    },


    // HELPERS
    getWidgets: function() {
      var widgets = this.status.get('options');
      return _.map(widgets,function(w){
        return w.id;
      });
    },

    getOptions: function(options) {
      if (!!options) {
        console.log(options);
        return _.groupBy(_.map(options.widgets,function(w){
          return {
            id: w.id,
            indicators: w.indicators,
            tabs: (!!w.tabs) ? w.tabs : null
          };
        }), 'id');
      }
    },

    objToUrl: function(obj) {
      var arr_temp = [];
      for (var p in obj) {
        if (obj.hasOwnProperty(p)) {
          arr_temp.push(obj[p]);
        }
      }
      return arr_temp.join('+');
    }


  });

  return CompareGridPresenter;

});
