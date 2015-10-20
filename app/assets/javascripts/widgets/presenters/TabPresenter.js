define([
  'mps',
  'backbone',
  'countries/presenters/PresenterClass'
], function(mps, Backbone, PresenterClass) {

  'use strict';

  var TabPresenter = PresenterClass.extend({

    init: function(view, setup) {
      this.view = view;
      this._super();
      this.status = new (Backbone.Model.extend({
        defaults: setup.status
      }));

      this._setListeners();
    },

    _setListeners: function() {

    },

  });

  return TabPresenter;

});
