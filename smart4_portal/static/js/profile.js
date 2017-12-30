var data = {
    lineChart: [
        {
            date: '2016-11-17',
            label: 'litres',
            value: 950
        },
        {
            date: '2016-11-18',
            label: 'litres',
            value: 1000
        },
        {
            date: '2016-11-19',
            label: 'litres',
            value: 700
        },
        {
            date: '2016-11-20',
            label: 'litres',
            value: 534
        },
        {
            date: '2016-11-21',
            label: 'litres',
            value: 1423
        },
        {
            date: '2016-11-22',
            label: 'litres',
            value: 1222
        },
        {
            date: '2016-11-23',
            label: 'litres',
            value: 948
        },
        {
            date: '2016-11-24',
            label: 'litres',
            value: 1938
        },
        {
            date: '2016-11-25',
            label: 'litres',
            value: 1245
        },
        {
            date: '2016-11-26',
            value: 888
        }
    ]
};

var DURATION = 1500;
var DELAY = 500;

/**
 * draw the fancy line chart
 *
 * @param {String} elementId elementId
 * @param {Array}  data      data
 */
function drawLineChart(elementId, data) {
    // parse helper functions on top
    var parse = d3.time.format('%Y-%m-%d').parse;
    // data manipulation first
    data = data.map(function (datum) {
        datum.date = parse(datum.date);

        return datum;
    });

    // TODO code duplication check how you can avoid that
    var containerEl = document.getElementById(elementId),
        width = containerEl.clientWidth,
        height = width * 0.4,
        margin = {
            top: 30,
            right: 10,
            left: 10
        },

        detailWidth = 98,
        detailHeight = 55,
        detailMargin = 10,

        container = d3.select(containerEl),
        svg = container.select('svg')
            .attr('width', width)
            .attr('height', height + margin.top),

        x = d3.time.scale().range([0, width - detailWidth]),
        xAxis = d3.svg.axis().scale(x)
            .ticks(8)
            .tickSize(-height),
        xAxisTicks = d3.svg.axis().scale(x)
            .ticks(16)
            .tickSize(-height)
            .tickFormat(''),
        y = d3.scale.linear().range([height, 0]),
        yAxisTicks = d3.svg.axis().scale(y)
            .ticks(12)
            .tickSize(width)
            .tickFormat('')
            .orient('right'),

        area = d3.svg.area()
            .interpolate('linear')
            .x(function (d) {
                return x(d.date) + detailWidth / 2;
            })
            .y0(height)
            .y1(function (d) {
                return y(d.value);
            }),

        line = d3.svg.line()
            .interpolate('linear')
            .x(function (d) {
                return x(d.date) + detailWidth / 2;
            })
            .y(function (d) {
                return y(d.value);
            }),

        startData = data.map(function (datum) {
            return {
                date: datum.date,
                value: 0
            };
        }),

        circleContainer;

    // Compute the minimum and maximum date, and the maximum price.
    x.domain([data[0].date, data[data.length - 1].date]);
    // hacky hacky hacky :(
    y.domain([0, d3.max(data, function (d) {
        return d.value;
    }) + 700]);

    svg.append('g')
        .attr('class', 'lineChart--xAxisTicks')
        .attr('transform', 'translate(' + detailWidth / 2 + ',' + height + ')')
        .call(xAxisTicks);

    svg.append('g')
        .attr('class', 'lineChart--xAxis')
        .attr('transform', 'translate(' + detailWidth / 2 + ',' + ( height + 7 ) + ')')
        .call(xAxis);

    svg.append('g')
        .attr('class', 'lineChart--yAxisTicks')
        .call(yAxisTicks);

    // Add the line path.
    svg.append('path')
        .datum(startData)
        .attr('class', 'lineChart--areaLine')
        .attr('d', line)
        .transition()
        .duration(DURATION)
        .delay(DURATION / 2)
        .attrTween('d', tween(data, line))
        .each('end', function () {
            drawCircles(data);
        });


    // Add the area path.
    svg.append('path')
        .datum(startData)
        .attr('class', 'lineChart--area')
        .attr('d', area)
        .transition()
        .duration(DURATION)
        .attrTween('d', tween(data, area));

    // Helper functions!!!
    function drawCircle(datum, index) {
        circleContainer.datum(datum)
            .append('circle')
            .attr('class', 'lineChart--circle')
            .attr('r', 0)
            .attr(
                'cx',
                function (d) {
                    return x(d.date) + detailWidth / 2;
                }
            )
            .attr(
                'cy',
                function (d) {
                    return y(d.value);
                }
            )
            .on('mouseenter', function (d) {
                d3.select(this)
                    .attr(
                        'class',
                        'lineChart--circle lineChart--circle__highlighted'
                    )
                    .attr('r', 7);

                d.active = true;

                showCircleDetail(d);
            })
            .on('mouseout', function (d) {
                d3.select(this)
                    .attr(
                        'class',
                        'lineChart--circle'
                    )
                    .attr('r', 6);

                if (d.active) {
                    hideCircleDetails();

                    d.active = false;
                }
            })
            .on('click touch', function (d) {
                if (d.active) {
                    showCircleDetail(d)
                } else {
                    hideCircleDetails();
                }
            })
            .transition()
            .delay(DURATION / 10 * index)
            .attr('r', 6);
    }

    function drawCircles(data) {
        circleContainer = svg.append('g');

        data.forEach(function (datum, index) {
            drawCircle(datum, index);
        });
    }

    function hideCircleDetails() {
        circleContainer.selectAll('.lineChart--bubble')
            .remove();
    }

    function showCircleDetail(data) {
        var details = circleContainer.append('g')
            .attr('class', 'lineChart--bubble')
            .attr(
                'transform',
                function () {
                    var result = 'translate(';

                    result += x(data.date);
                    result += ', ';
                    result += y(data.value) - detailHeight - detailMargin;
                    result += ')';

                    return result;
                }
            );

        details.append('path')
            .attr('d', 'M2.99990186,0 C1.34310181,0 0,1.34216977 0,2.99898218 L0,47.6680579 C0,49.32435 1.34136094,50.6670401 3.00074875,50.6670401 L44.4095996,50.6670401 C48.9775098,54.3898926 44.4672607,50.6057129 49,54.46875 C53.4190918,50.6962891 49.0050244,54.4362793 53.501875,50.6670401 L94.9943116,50.6670401 C96.6543075,50.6670401 98,49.3248703 98,47.6680579 L98,2.99898218 C98,1.34269006 96.651936,0 95.0000981,0 L2.99990186,0 Z M2.99990186,0')
            .attr('width', detailWidth)
            .attr('height', detailHeight);

        var text = details.append('text')
            .attr('class', 'lineChart--bubble--text');

        text.append('tspan')
            .attr('class', 'lineChart--bubble--label')
            .attr('x', detailWidth / 2)
            .attr('y', detailHeight / 3)
            .attr('text-anchor', 'middle')
            .text(data.label);

        text.append('tspan')
            .attr('class', 'lineChart--bubble--value')
            .attr('x', detailWidth / 2)
            .attr('y', detailHeight / 4 * 3)
            .attr('text-anchor', 'middle')
            .text(data.value);
    }

    function tween(b, callback) {
        return function (a) {
            var i = d3.interpolateArray(a, b);

            return function (t) {
                return callback(i(t));
            };
        };
    }
}

function ಠ_ಠ() {
    drawLineChart('lineChart', data.lineChart);
}

function buildHeatmap() {
    var margin = { top: 50, right: 0, bottom: 100, left: 150 },
          width = 960 - margin.left - margin.right,
          height = 430 - margin.top - margin.bottom,
          gridSize = Math.floor(width / 24),
          legendElementWidth = gridSize*2,
          buckets = 9,
          colors = ["#ffffd9","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#253494","#081d58"], // alternatively colorbrewer.YlGnBu[9]
          days = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
          times = ["1a", "2a", "3a", "4a", "5a", "6a", "7a", "8a", "9a", "10a", "11a", "12a", "1p", "2p", "3p", "4p", "5p", "6p", "7p", "8p", "9p", "10p", "11p", "12p"];
          datasets = ["/static/data/data.tsv", "/static/data/data2.tsv"];

      var svg = d3.select("#chart").append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      var dayLabels = svg.selectAll(".dayLabel")
          .data(days)
          .enter().append("text")
            .text(function (d) { return d; })
            .attr("x", 0)
            .attr("y", function (d, i) { return i * gridSize; })
            .style("text-anchor", "end")
            .attr("transform", "translate(-6," + gridSize / 1.5 + ")")
            .attr("class", function (d, i) { return ((i >= 0 && i <= 4) ? "dayLabel mono axis axis-workweek" : "dayLabel mono axis"); });

      var timeLabels = svg.selectAll(".timeLabel")
          .data(times)
          .enter().append("text")
            .text(function(d) { return d; })
            .attr("x", function(d, i) { return i * gridSize; })
            .attr("y", 0)
            .style("text-anchor", "middle")
            .attr("transform", "translate(" + gridSize / 2 + ", -6)")
            .attr("class", function(d, i) { return ((i >= 7 && i <= 16) ? "timeLabel mono axis axis-worktime" : "timeLabel mono axis"); });

      var heatmapChart = function(tsvFile) {
        d3.tsv(tsvFile,
        function(d) {
          return {
            day: +d.day,
            hour: +d.hour,
            value: +d.value
          };
        },
        function(error, data) {
          var colorScale = d3.scale.quantile()
              .domain([0, buckets - 1, d3.max(data, function (d) { return d.value; })])
              .range(colors);

          var cards = svg.selectAll(".hour")
              .data(data, function(d) {return d.day+':'+d.hour;});

          cards.append("title");

          cards.enter().append("rect")
              .attr("x", function(d) { return (d.hour - 1) * gridSize; })
              .attr("y", function(d) { return (d.day - 1) * gridSize; })
              .attr("rx", 4)
              .attr("ry", 4)
              .attr("class", "hour bordered")
              .attr("width", gridSize)
              .attr("height", gridSize)
              .style("fill", colors[0]);

          cards.transition().duration(1000)
              .style("fill", function(d) { return colorScale(d.value); });

          cards.select("title").text(function(d) { return d.value; });

          cards.exit().remove();

          var legend = svg.selectAll(".legend")
              .data([0].concat(colorScale.quantiles()), function(d) { return d; });

          legend.enter().append("g")
              .attr("class", "legend");

          legend.append("rect")
            .attr("x", function(d, i) { return legendElementWidth * i; })
            .attr("y", height)
            .attr("width", legendElementWidth)
            .attr("height", gridSize / 2)
            .style("fill", function(d, i) { return colors[i]; });

          legend.append("text")
            .attr("class", "mono")
            .text(function(d) { return "≥ " + Math.round(d); })
            .attr("x", function(d, i) { return legendElementWidth * i; })
            .attr("y", height + gridSize);

          legend.exit().remove();

        });
      };

      heatmapChart(datasets[0]);

      var datasetpicker = d3.select("#dataset-picker").selectAll(".dataset-button")
        .data(datasets);

      datasetpicker.enter()
        .append("input")
        .attr("value", function(d){ return "Dataset " + d })
        .attr("type", "button")
        .attr("class", "dataset-button")
        .on("click", function(d) {
          heatmapChart(d);
        });
}

function runMeter(n, t) {
    var t = parseInt($(".meter-bg > span").eq(n).attr("data-in"));
    t++;
    $(".meter-bg > span").eq(n).attr("data-in", t).animate({
        top: "-=22px"
    }, 1000, "linear", function () {
        t == 10 && $(".meter-bg > span").eq(n).attr("data-in", "0").css("top", "0")
    })
}

window.onload = function () {
    $(".meter-bg > span").eq(3).css("top", "-110px");
    $(".meter-bg > span").eq(4).css("top", "-44px");
    $(".meter-bg > span").eq(5).css("top", "-154px");
    setInterval(function () {
        $(".meter-bg > span").eq(0).animate({
            top: "0"
        }, 2743, "linear", function () {
            runMeter(4)
        });
        $(".meter-bg > span").eq(1).animate({
            top: "0"
        }, 27400, "linear", function () {
            runMeter(3)
        });
        $(".meter-bg > span").eq(5).animate({
            top: "-220px"
        }, 1000, "linear", function () {
            $(this).css("top", "0")
        })
    }, 0);

    // build chart
    ಠ_ಠ();

    buildHeatmap();
};
