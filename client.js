TemplateSubscriptions = {};
TemplateSubscriptions._blazeFireCallbacks = Blaze._fireCallbacks;

/*
 * Setup variables used in template
 */
TemplateSubscriptions.initTemplate = function(view){
  if( view.template && view.template.subscriptions ){
    view.template._subscriptionsList = view.template.subscriptions();
    view.template._subscriptionState = {};
    view.template._subscriptionsReady = new ReactiveVar( false );
    _.forEach(view.template._subscriptionsList, function( sub ){
      var hash = EJSON.stringify(sub);
      view.template._subscriptionState[hash] = false;
    });
    view._originalRender = view._render;
    view._render = function(){
      if( view.template._subscriptionsReady.get() ){
        return view._originalRender();
      }else{
        return Template.spinner._render();
      }
    }
  }
}

/*
 * Call init and startup subscriptions for template
 */
TemplateSubscriptions._createdCallback = function(view){
  TemplateSubscriptions.initTemplate( view );
  if( view.template && view.template.subscriptions ){
    _.forEach(view.template._subscriptionsList, function( sub ){
      var hash = EJSON.stringify(sub);
      var readyCallback = function( ){
        view.template._subscriptionState[hash] = true;
        _.forEach(view.template._subscriptionList, function(sub ){
          var hash = EJSON.stringify(args);
          if( !view.template._subscriptionState[hash] ){
            return false;
          }
        });
        view.template._subscriptionsReady.set( true );
      }

      sub.push( readyCallback );
      Meteor.subscribe.apply( Meteor, sub );
    });
  }
}

Blaze._fireCallbacks = function(view, which){
  if( which === "created" ){
    TemplateSubscriptions._createdCallback(view);
  }
  TemplateSubscriptions._blazeFireCallbacks(view, which);
}

/*Blaze._materializeView = function( view, parentView){
  TemplateSubscriptions._blazeMaterializeView( view, parentView );
}*/
