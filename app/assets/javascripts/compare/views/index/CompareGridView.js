define([
  'backbone',
  'compare/presenters/CompareGridPresenter',
  'text!compare/templates/compareGrid.handlebars',
], function(Backbone, CompareMainPresenter, tpl) {

  var CompareMainView = Backbone.View.extend({

    el: '#compareGridView',

    template: Handlebars.compile(tpl),

    initialize:function() {
      this.presenter = new CompareMainPresenter(this);
      this.status = this.presenter.status;
    },

    setListeners: function() {

    },

    render: function() {
      this.$el.html(this.template(this.parseData()));

      // var widgets = [],
      //     promises = [];


      _.map(this.status.get('data'), _.bind(function(c){
        var $el = $('#compare-grid-'+c.iso);
        _.each(c.widgets, _.bind(function(w) {
          var deferred = $.Deferred();

          // var currentWidget = new WidgetView({
          //   id: w.id,
          //   options: this.status.get('options')[w.id]
          // });

          // widgets.push(currentWidget);

          // currentWidget._loadMetaData(function(data) {
          //   deferred.resolve(data);
          // });

          // promises.push(deferred);
        }, this ));

        // $.when.apply(null, promises).then(function() {
        //   widgets.forEach(function(widget) {
        //     widget.render();
        //     $el.append(widget.el);
        //   });
        // });
      }, this ));
    },

    parseData: function() {
      return { countries: this.status.get('data') };
    }



  });

  return CompareMainView;

});
