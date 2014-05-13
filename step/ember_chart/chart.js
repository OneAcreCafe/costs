App = Ember.Application.create()

App.ApplicationAdapter = DS.FixtureAdapter.extend()

App.Router.map( function() {
    this.resource( 'from-data', { path: '/' } )
    this.resource( 'from-store', { path: '/store' } )
} )

App.LineItem = DS.Model.extend( {
    name: DS.attr( 'string' ),
    cost:  DS.attr( 'number' ),
    time: DS.attr( 'date' )
} )

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

App.FromDataRoute = Ember.Route.extend( {
    model: function() {
        return data
    }
} )
  
App.FromStoreRoute = Ember.Route.extend( {
    model: function() {
        return this.store.find( 'line-item' )
    }
} )

App.PosNegStepChartComponent = Ember.Component.extend( {
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
            return a.time.getTime() - b.time.getTime()
        } )
        
        var set = {
            pos: data.filter( function( d ) { return d.cost >= 0 } ),
            neg: data.filter( function( d ) { return d.cost < 0 } )
        }

        var step = {}
        for( type in set ) {
            var total = 0
            step[type] = []
            set[type].forEach( function( d ) {
	        if( total > 0 ) {
	            step[type].push( {
		        time: d.time,
		        cost: total
	            } )
	        }
	        step[type].push( {
	            name: d.name,
	            time: d.time,
	            cost: total += Math.abs( d.cost )
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
