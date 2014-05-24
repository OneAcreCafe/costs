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
    portions: DS.hasMany( 'portion' )
} )

App.Portion = DS.Model.extend( {
    ingredient: DS.belongsTo( 'ingredient' ),
    quantity: DS.attr( 'number' ),
    unit: DS.attr( 'number' )
} )

App.Ingredient = DS.Model.extend( {
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
} )()

App.WellsRoute = Ember.Route.extend( {
    model: function() {
        return this.store.find( 'well' )
    }
} )

App.WellRoute = Ember.Route.extend( {
    model: function( params ) {
        return this.store.find( 'well', params.well_id )
    }
} )

App.ReadingsRoute = Ember.Route.extend( {
    model: function() {
        var self = this
        return this.store
            .findQuery( 'reading', {
                designDoc: 'reading',
                viewName: 'by_time',
                options: {
                    descending: true,
                    limit: 100
                }
            } )
            .then( function( data ) { return data },
                   function() { self.transitionTo( 'login' ) } )
    }
} )

App.ReadingRoute = Ember.Route.extend( {
    model: function() {
        return typeof(params) !== 'undefined' && this.store.find( 'reading', params.reading_id )
    }
} )

var gpsCoordinate
navigator.geolocation.getCurrentPosition( function( position ) {
    gpsCoordinate = { x: position.coords.longitude, y: position.coords.latitude }
} )

App.NewReadingController = Ember.ObjectController.extend( {
    init: function() {
        this._super()
        this.set( 'wells', Ember.ArrayProxy.createWithMixins( Ember.SortableMixin, {
            content: this.get( 'store' ).find( 'well' ),
            sortProperties: ['name'],
            sortAscending: true,
            orderBy: function( item1, item2 ) {
                if( gpsCoordinate ) {
                    function distance( p1, p2 ) {
                        return Math.sqrt( Math.pow( p1.x - p2.x, 2 ) + Math.pow( p1.y - p2.y, 2 ) )
                    }
                    
                    function toGPS( item ) {
                        return distance(
                            gpsCoordinate,
                            {
                                x: Ember.get( item, 'longitude' ),
                                y: Ember.get( item, 'latitude' )
                            }
                        )
                    }

                    var offsets = [ toGPS( item1 ), toGPS( item2 ) ]
                    
                    return offsets[0] - offsets[1]
                } else {
                    return Ember.get( item1, 'name' ).localeCompare( Ember.get( item2, 'name' ) )
                }
            }
        } ) )
    },
    actions: {
        save: function() {
            var self = this
            var store = this.get( 'store' )
            store.find( 'well', $('#well').val() ).then( function( well ) {
                var reading = store.createRecord( 'reading', {
                    well: well,
                    time: new Date(),
                    mcf: $('#mcf').val(),
                    line: $('#line').val(),
                    tbg: $('#tbg').val(),
                    csg: $('#csg').val()
                } )
                reading.save()

                well.get( 'readings' ).then( function( readings ) {
                    readings.pushObject( reading )
                    well.save()
                } )

                self.transitionToRoute( 'readings' )
            } )
        }
    }
} )

App.NewWellController = Ember.ObjectController.extend( {
    actions: {
        save: function() {
            var self = this
            var store = this.get( 'store' )
            var well = store.createRecord( 'well', {
                asset_id: $('#asset-id').val(),
                name: $('#name').val()
            } )
            well.save()
            
            self.transitionToRoute( 'wells' )
        }
    }
} )

App.LoginController = Ember.ObjectController.extend( {
    actions: {
        login: function() {
            var self = this
            console.log( "%@/_session?user=%@&pass=%@".fmt(App.Host, $('#username').val(), $('#password').val() ) )
            $
                .ajax( {
                    url: "%@/_session?user=%@&pass=%@".fmt( App.Host, $('#username').val(), $('#password').val() )
                } )
                .then(
                    function( response ) {
                        self.transitionToRoute( 'readings' )
                        return response
                    },
                    function() {
                        console.log( 'error' )
                    }
                )
                       
        }
    }
} )


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
