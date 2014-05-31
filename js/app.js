App = Ember.Application.create()

App.ApplicationAdapter = DS.FixtureAdapter.extend()

App.Host = 'http://localhost:5984'

/*
App.ApplicationAdapter = EmberCouchDBKit.DocumentAdapter.extend( { db: 'wells', host: App.Host } )
App.ApplicationSerializer = EmberCouchDBKit.DocumentSerializer.extend()

App.AttachmentAdapter = EmberCouchDBKit.AttachmentAdapter.extend( { db: 'wells', host: App.Host } )
App.AttachmentSerializer = EmberCouchDBKit.AttachmentSerializer.extend()
*/

App.Router.map( function() {
    this.resource( 'menus' )
    this.resource( 'menu', { path: '/menu/:date' } )
    this.resource( 'recipes', { path: '/' } )
    this.resource( 'recipe', { path: '/recipe/:recipe_id' } )
    this.resource( 'new_recipe', { path: '/recipe/new' } )
    this.resource( 'login', { path: '/login' } )
} )

App.Menu = DS.Model.extend( {
    items: DS.hasMany( 'menu-item' ),
    date: DS.attr( 'date' )
} )

App.MenuItem = DS.Model.extend( {
    recipe: DS.belongsTo( 'recipe' ),
    category: DS.belongsTo( 'category' ),
} )

App.Recipe = DS.Model.extend( {
    portions: DS.hasMany( 'portion' ),
    mid: DS.attr( 'string' )    
} )

App.Portion = DS.Model.extend( {
    ingredient: DS.belongsTo( 'ingredient' ),
    quantity: DS.attr( 'number' ),
    unit: DS.belongsTo( 'unit' )
} )

App.Ingredient = DS.Model.extend( {
    name: DS.attr( 'string' ),
    mid: DS.attr( 'string' )    
} )

App.Unit = DS.Model.extend( {
    name: DS.attr( 'string' ),
    abbreviation: DS.attr( 'string' ),
    type: DS.attr( 'string' ),
    perBase: DS.attr( 'number' ),
    mid: DS.attr( 'string' )    
} )

App.Price = DS.Model.extend( {
    portion: DS.belongsTo( 'portion' ),
    cost: DS.attr( 'number' )
} )

App.LineItem = DS.Model.extend( {
    name: DS.attr( 'string' ),
    cost: DS.attr( 'number' ),
    time: DS.attr( 'date' )
} )

;( function() {
    var data = []
    for( var i = 1; i <= 100; i++ ) {
        data.push( {
            id: i,
	    name: "Item #" + i,
	    cost: ( Math.random() < .25 ? -1 : 1 ) * ( 5 + Math.random() * 3 ),
	    time: new Date( ( new Date() ).getTime() + ( 1000 * 60 * 60 * 24 * 7 ) * Math.random() ) 
        } )
    }
    App.LineItem.FIXTURES = data
    App.Recipe.FIXTURES = []
} )()

App.RecipesRoute = Ember.Route.extend( {
    model: function() {
        return this.store.find( 'recipe' )
    }
} )

App.RecipeRoute = Ember.Route.extend( {
    model: function( params ) {
        return this.store.find( 'recipe', params.id )
    }
} )

App.NewRecipeController = Ember.ObjectController.extend( {
    importModalId: function() {
        return this.get('elementId') + "importAlertModal";
    }.property('elementId'),
    actions: {
        save: function() {
            var self = this
            var store = this.get( 'store' )
            console.error( 'recipe not saved' )
            self.transitionToRoute( 'recipes' )
        },
        showImportModal: function( node ) {
            console.log('Showing import modal for node: ' + node);
            console.log( this.get( 'importModalId' ) )
            $("#" + this.get( 'importModalId' )).modal( 'show' )
        }

    }
} )

App.NewRecipeView = Ember.View.extend({
    didInsertElement: function(){
        this._super()
        Ember.run.scheduleOnce( 'afterRender', this, function() {
            window.initRecipe()
        });
    }
});

Ember.Handlebars.registerBoundHelper( 'format-time-passed', function( time ) {
    return moment( time ).fromNow()
} )

Ember.Handlebars.registerBoundHelper( 'format-time-long', function( time ) {
    return moment( time ).format( 'LLL' )
} )

Ember.Handlebars.registerBoundHelper( 'format-time-numeric', function( time ) {
    return moment( time ).format( 'YYYY/M/D @ H:mm' )
} )

Ember.Handlebars.registerBoundHelper( 'two-digit-float', function( number ) {
    return Number( number ).toFixed( 2 )
} )

Ember.LinkView.reopen( {
    attributeBindings: [ 'data-toggle', 'data-target' ]
} )

App.MenuCalendarComponent = Ember.Component.extend( {
    tagName: 'svg',
    attributeBindings: 'width height'.w(),
    margin: { top: 20, right: 20, bottom: 30, left: 40 },
    
    w: function() {
        return ( this.get( 'width' ) || 600 ) - this.get( 'margin.left' ) - this.get( 'margin.right' )
    }.property( 'width' ),
  
    h: function() {
        return ( this.get( 'height' ) || 400 ) - this.get( 'margin.top' ) - this.get( 'margin.bottom' )
    }.property( 'height' ),
  
    transformG: function() {
        return "translate(" + this.get( 'margin.left' ) + "," + this.get( 'margin.top' ) + ")"
    }.property(),
      
    transformX: function(){
        return "translate(0," + this.get( 'h' ) + ")"
    }.property( 'h' ),
  
    draw: function(){
        var data = this.get( 'data' )

        if( data.content ) {
            data = data.content
        }

        if( typeof data === 'undefined' ) {
            console.error( 'Data is not defined' )
            return
        }

        var margin = { top: 20, right: 20, bottom: 30, left: 50 }
        var width = this.get( 'w' )
        var height = this.get( 'h' )

        var x = d3.time.scale()
            .range( [0, width] )

        var y = d3.scale.linear()
            .range( [height, 0] )

        var xAxis = d3.svg.axis()
            .scale( x )
            .orient( 'bottom' )

        var yAxis = d3.svg.axis()
            .scale( y )
            .orient( 'left' )

        var svg = d3.select( "#" + this.get( 'elementId' ) )
            .attr( {
	        viewBox: "0 0 " + ( width + margin.left + margin.right ) + " " + ( height + margin.top + margin.bottom )
            } )
            .append( 'g' )
            .attr( 'transform', "translate(" + margin.left + "," + margin.top + ")" )

        data.sort( function( a, b ) {
            return a.get( 'time' ).getTime() - b.get( 'time' ).getTime()
        } )
        
        var set = {
            pos: data.filter( function( d ) { return d.get( 'cost' ) >= 0 } ),
            neg: data.filter( function( d ) { return d.get( 'cost' ) < 0 } )
        }

        var step = {}
        for( type in set ) {
            var total = 0
            step[type] = []
            set[type].forEach( function( d ) {
	        if( total > 0 ) {
	            step[type].push( {
		        time: d.get( 'time' ),
		        cost: total
	            } )
	        }
	        step[type].push( {
	            name: d.get( 'name' ),
	            time: d.get( 'time' ),
	            cost: total += Math.abs( d.get( 'cost' ) )
	        } )
            } )
        }

        var steps = step['pos'].concat( step['neg'] )
        x.domain( d3.extent( steps, function( d ) { return d.time } ) )
        y.domain( d3.extent( steps, function( d ) { return d.cost } ) )

        svg.append( 'g' )
            .attr( {
	        class: 'x axis',
	        transform: "translate(0," + height + ")"
            } )
            .call( xAxis )

        svg.append( 'g' )
            .attr( 'class', 'y axis' )
            .call( yAxis )

        var line = d3.svg.line()
            .x( function( d ) { return x( d.time ) } )
            .y( function( d ) { return y( d.cost ) } )

        for( type in step ) {
            svg.append( 'path' )
	        .datum( step[type] )
	        .attr( {
	            class: "line " + type,
	            d: line
	        } )
        }
    },
  
    didInsertElement: function() {
        this.draw()
    }
} )
