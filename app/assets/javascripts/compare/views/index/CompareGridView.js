define([
  'backbone',
  'compare/presenters/CompareGridPresenter',
  'widgets/views/WidgetView',
  'text!compare/templates/compareGrid.handlebars',
], function(Backbone, CompareMainPresenter, WidgetView, tpl) {

  var CompareMainView = Backbone.View.extend({

    el: '#compareGridView',

    events: {
      'click .lock-mode' : 'toggleLock'
    },

    template: Handlebars.compile(tpl),

    initialize:function() {
      this.presenter = new CompareMainPresenter(this);
    },

    setListeners: function() {

    },

    render: function() {
      this.$el.html(this.template(this.parseData()));

      if (!!this.widgets && !!this.widgets.length) {
        this.destroy();
      }

      this.widgets = [];
      this.promises = [];

      var widgetsIds = this.presenter.status.get('widgetsActive');
      var data = this.presenter.status.get('data');

      // Loop each widget and get data of each compare
      _.each(widgetsIds, _.bind(function(w){
        _.each(data, _.bind(function(c,i){
          var deferred = $.Deferred();
          var slug = this.presenter.objToSlug(this.presenter.status.get('compare'+(i+1)),'');
          var slug_compare = this.presenter.objToSlug(this.presenter.status.get('compare'+((data.length) - i )), '');
          var currentWidget = new WidgetView({
            id: w,
            className: 'gridgraphs--widget',
            model: {
              id: w,
              location: this.presenter.status.get('compare'+(i+1)),
              location_compare: this.presenter.status.get('compare'+((data.length) - i )),
              slug: slug,
              slug_compare: slug_compare,
            },
            status: this.presenter.status.get('options')[slug][w][0]
          });

          currentWidget._loadMetaData(function(data) {
            deferred.resolve(data);
          });

          // Set persistent variables
          this.widgets.push(currentWidget);
          this.promises.push(deferred);
        }, this ));
      }, this ));

      $.when.apply(null, this.promises).then(_.bind(function() {
        this.widgets.forEach(function(widget) {
          widget.render();
          $('#gridgraphs-compare-'+widget.id).append(widget.el);
        });
      },this));
    },

    parseData: function() {
      return {
        widgets: this.presenter.status.get('widgetsActive')
      };
    },

    // Events
    toggleLock: function(e) {
      var is_locked = $(e.currentTarget).hasClass('is-locked');
      $(e.currentTarget).toggleClass('is-locked', !is_locked);
      this.presenter.toggleLock($(e.currentTarget).data('id'), is_locked);
    },

    destroy: function() {
      this.widgets.forEach(function(widget) {
        widget.destroy();
      });
    }



  });

  return CompareMainView;

});
