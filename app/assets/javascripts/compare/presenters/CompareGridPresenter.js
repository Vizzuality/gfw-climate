define([
  'backbone',
  'mps',
  'compare/presenters/PresenterClass',
  'compare/services/CompareService'
], function(Backbone, mps, PresenterClass, CompareService) {

  'use strict';

  var CompareMainPresenter = PresenterClass.extend({

    status: new (Backbone.Model.extend({
      defaults: {
        name: 'compare-countries'
      }
    })),

    init: function(view) {
      this._super();
      this.service = CompareService;
      this.view = view;
      this.setListeners();
    },

    setListeners: function() {
      this.status.on('change:compare1 change:compare2', this.changeCompare, this);
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


    _onPlaceGo: function(params) {
      if (!!params.compare1 && !!params.compare2) {
        this.status.set('compare1', params.compare1);
        this.status.set('compare2', params.compare2);
      }
    },

    _onCompareUpdate: function(params) {
      if (!!params.compare1 && !!params.compare2) {
        this.status.set('compare1', params.compare1);
        this.status.set('compare2', params.compare2);
      }
    },

    // COMPARE EVENTS
    changeCompare: function() {
      var compare1 = this.objToUrl(this.status.get('compare1'));
      var compare2 = this.objToUrl(this.status.get('compare2'));
      if (!!compare1 && !!compare2) {
        this.service.execute(compare1,compare2,_.bind(this.successCompare, this),_.bind(this.errorCompare, this));
      }
    },

    successCompare: function(data) {
      console.log(data);
    },

    errorCompare: function() {
      console.log(arguments);
    },

    // HELPER
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

  return CompareMainPresenter;

});
