;!( function( w, d ) {
    'use strict';
    var titles = d.querySelectorAll( '.title' )
    for ( var i=0; i < titles.length; i++ )
        titles[ i ].onclick = function( e ) {
            for ( var j = 0; j < titles.length; j++ )
                if ( this != titles[ j ] )
                    titles[ j ].parentNode.className = titles[ j ].parentNode.className.replace( / open/i, '' );
            var cn = this.parentNode.className;
            this.parentNode.className = ~cn.search( /open/i ) ? cn.replace( / open/i, '' ) : cn + ' open';
        };
})( this, document );