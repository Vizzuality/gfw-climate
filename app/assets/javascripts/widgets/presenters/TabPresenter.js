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

      this.model = new (Backbone.Model.extend({
        defaults: {
          iso: setup.iso,
          data: setup.data,
          indicators: setup.indicators
        }
      }));

      this.status = new (Backbone.Model.extend({
        defaults: setup.status
      }));

      this._setListeners();
    },

    _setListeners: function() {
      this.status.on('change', this.publish, this);
    },

    // THRESHOLD
    changeThreshold: function(thresh) {
      var tabs = _.clone(this.status.get('tabs'))
      tabs.thresh = (~~thresh);
      this.status.set('tabs', tabs);
    },

    // PUBLISH the current status of this tab
    publish: function() {
      this.view.widget.changeStatus(this.status.toJSON());
    }

  });

  return TabPresenter;

});
