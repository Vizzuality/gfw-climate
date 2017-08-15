define(['backbone', 'data-download/views/FilterCardView'], function(Backbone, FilterCardView) {
  'use strict';
  var DataDownloadIndexView = Backbone.View.extend({

    filters: [{
      name: 'Countries',
      id: 'countries-filter'
    }],

    initialize: function() {
      this.initCards()
    },

    initCards: function() {
      this.filterViews = [];
      this.filters.forEach(function(el) {
        this.filterViews.push(new FilterCardView({
          el: el.id,
          name: el.name
        }));
      }, this);
    }
  });

  return DataDownloadIndexView;
});
