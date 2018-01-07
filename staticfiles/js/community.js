/**
 * Created by Levabd on 16-Nov-16.
 */
// external js: isotope.pkgd.js

window.onload = function() {

    // init Isotope
    var $grid = $('.grid').isotope({
        itemSelector: '.element-item',
        layoutMode: 'fitRows',
        fitRows: {
          gutter: 30
        },
        getSortData: {
            price: '.price parseInt',
            service: '.service parseInt',
            community: '.community parseInt',
            employer: '.employer parseInt',
            social: '.social parseInt',
        }
    });

    //Set main-content height
    $('.grid').resize(function() {
        $( ".main-content" ).height($('.grid').height());
        console.log('height has been changed');
    });

    // filter functions
    var filterFns = {

        trustnessGreaterThan70: function () {
            var trustness = $(this).find('.trustness').text();
            return parseInt(trustness, 10) > 70;
        },
        qualityGreaterThan70: function () {
            var quality = $(this).find('.quality').text();
            return parseInt(quality, 10) > 70;
        },
        coverageGreaterThan90: function () {
            var coverage = $(this).find('.coverage').text();
            return parseInt(coverage, 10) > 90;
        }
    };

    // bind sort button click
    $('.company-filters').on( 'click', 'a', function() {
      var sortValue = $(this).attr('data-sort-value');
      $grid.isotope({ sortBy: sortValue });
    });

    $('#profile-submit').on( 'click', function() {
        $("#profile-li").removeClass( "active" );
        $("#companies-li").addClass( "active" );
        setInterval(function(){ $grid.isotope({filter: '*'}); }, 500);
    });

    $('#comparision-submit').on( 'click', function() {
        $("#companies-li").removeClass( "active" );
        $("#comparision-li").addClass( "active" );
    });

    $('.element-item').on( 'click', function() {
        var company = $(this).find( '.post-block-title h2' ).text();
        var card = $(this).attr('data-id');
        $('#' + card).show();
        $("#selected-company").append("<li>" + company + "</li>");
    });

    // bind filter button click
    $('.company-filters').on('click', "a", function () {
        var filterValue = $(this).attr('data-filter');
        // use filterFn if matches value
        filterValue = filterFns[filterValue] || filterValue;
        $grid.isotope({filter: filterValue});
    });
    // change is-checked class on buttons
    $('.company-filters').each(function (i, filterGroup) {
        var filterGroup = $(filterGroup);
        filterGroup.on('click', 'a', function () {
            filterGroup.find('.active').removeClass('active');
            $(this).parent().addClass('active');
        });
    });


};
