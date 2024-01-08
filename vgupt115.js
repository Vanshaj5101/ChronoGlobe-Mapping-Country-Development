
var countryRegionData
var globalDevelopmentData
var globalData = []
var worldRegionDict = {}
var allWorldRegions = new Set()
var years = getYears(1980, 2013)
var globalRegionSelected = []
var colors
var colorCodes = ["#F22B67", "#F69402", "#F1DF01", "#50E600", "#02A4ED", "#7E25D7", "#00798D"]
let attributes = ["Health_Birth_Rate", "Health_Death_Rate", "Health_Fertility_Rate",
    "Health_Life_Expentancy_At_Birth", "Infra_Telephone_Lines_Per_100", "Rural_Agri_Land_Percent",
    "Rural_Agri_Arable_Land_Percent", "Rural_Land_Area", "Urban_Population_Density",
    "Urban_Population_Percent", "Health_Population_Growth"]
var dataLen = 0
// xaxis declaration
let xScale = d3.scaleLinear()
let xAxisCall = d3.axisBottom()
var width = 1500
var height = 500
var margin = { top: 10, bottom: 30, left: 50, right: 50 }
var chartWidth = width - margin.left - margin.right - 40;
var chartHeight = height - margin.top - margin.bottom - 20


document.addEventListener('DOMContentLoaded', function () {
    Promise.all([d3.csv('data/countries_regions.csv'), d3.csv('data/global_development.csv')])
        .then(function (values) {

            // getting data from csv files
            countryRegionData = values[0]
            globalDevelopmentData = values[1]

            // generating required data
            getData(countryRegionData, globalDevelopmentData)
            createMenuBar(AxisOpitons = attributes, years = years, regions = allWorldRegions)

            drawBeeSwarmChart()
        })


})

// TODO - Region dropdown
// Play button
// Play button animation
// bubble tick remove

function getData(countryRegionData, globalDevelopmentData) {
    countryRegionData.forEach(e => {
        worldRegionDict[e.name] = {
            "region": e["World bank region"],
            "code": e["geo"]
        }

        allWorldRegions.add(e["World bank region"])
    });

    globalData = globalDevelopmentData.map(d => {
        return {
            "Year": d.Year,
            "Country": d.Country,
            "Health_Birth_Rate": d["Data.Health.Birth Rate"],
            "Health_Death_Rate": d["Data.Health.Death Rate"],
            "Health_Fertility_Rate": d["Data.Health.Fertility Rate"],
            "Health_Life_Expentancy_At_Birth": d["Data.Health.Life Expectancy at Birth, Total"],
            "Infra_Telephone_Lines_Per_100": d["Data.Infrastructure.Telephone Lines per 100 People"],
            "Rural_Agri_Land_Percent": d["Data.Rural Development.Agricultural Land Percent"],
            "Rural_Agri_Arable_Land_Percent": d["Data.Rural Development.Arable Land Percent"],
            "Rural_Land_Area": d["Data.Rural Development.Land Area"],
            "Urban_Population_Density": d["Data.Urban Development.Population Density"],
            "Urban_Population_Percent": d["Data.Urban Development.Urban Population Percent"],
            "Health_Population_Growth": d["Data.Health.Population Growth"],
            "Region": worldRegionDict[d.Country].region,
            "Code": worldRegionDict[d.Country].code

        }
    })

    colors = d3.scaleOrdinal().domain(allWorldRegions).range(colorCodes)
}

function createMenuBar(AxisOpitons, years, regions) {
    // create x axis dropdown

    labelForXAxis = getLabelForDropdown("X-axisDiv", "X-axis attribute : ", "xAxisSelection")
    xAxisSelect = createDropdown("xAxisSelection", "xAxisSelect", AxisOpitons)
    document.getElementById("menuContainer").appendChild(labelForXAxis).appendChild(xAxisSelect)

    labelForSize = getLabelForDropdown("ChartSize", "Size attribute : ", "yAxisSelection")
    yAxisSelect = createDropdown("yAxisSelection", "yAxisSelect", AxisOpitons)
    document.getElementById("menuContainer").appendChild(labelForSize).appendChild(yAxisSelect)

    labelForYear = getLabelForDropdown("YearDiv", "Year : ", "yearInput")
    yearInput = createYearInput("yearInput", "yearInputBox", "number")
    document.getElementById("menuContainer").appendChild(labelForYear).appendChild(yearInput)

    document.getElementById("menuContainer").appendChild(getPlayButton())

    labelForBoxPlot = getLabelForDropdown("boxPlotSelect", "Box Plot attribute : ", "boxPlotSeleciton")
    boxSelect = createDropdown("boxPlotSeleciton", "boxPlotDropdown", AxisOpitons)
    document.getElementById("menuContainer").appendChild(labelForBoxPlot).appendChild(boxSelect)

    var regionSelectOption = document.getElementById("formId")
    regionSelectOption.addEventListener("change", () => {
        globalRegionSelected = []
        var eachCheckBox = document.getElementsByClassName("checkBoxOption")
        for (var i of eachCheckBox) {
            if (i.checked) {
                globalRegionSelected.push(i.value)
            }
        }
    })
}


function drawBeeSwarmChart() {
    var requiredDataset = []
    var rootContainer = document.getElementById("root")
    rootContainer.addEventListener("change", () => {
        var selectedXAxis = document.getElementById("xAxisSelect")
        var selectedYAxis = document.getElementById("yAxisSelect")
        // var selectedRegion = document.getElementById("regionSelect")
        var selectedYear = document.getElementById("yearInputBox")
        var selectedBoxAttribute = document.getElementById("boxPlotDropdown")



        var beeSwarmSvg = d3.select("#beeswarmChartPlot")
        if (selectedXAxis.value == "None" || selectedYAxis.value == "None" || globalRegionSelected.length == 0 || selectedYear.value < 1980 || selectedYear.value > 2013) {

            beeSwarmSvg.selectAll("*").remove()
        } else {
            console.log("else block called...")
            requiredDataset = []
            for (var i = 0; i < globalData.length; i++) {
                if (globalData[i]["Year"] == selectedYear.value) {
                    if (globalRegionSelected.includes("SelectAll")) {
                        requiredDataset.push([globalData[i]["Country"], globalData[i][selectedXAxis.value], globalData[i][selectedYAxis.value],
                        globalData[i]["Region"], globalData[i]["Code"]])
                    } else {
                        if (globalRegionSelected.includes(globalData[i]["Region"])) {
                            // console.log(globalData[i]["Country"], globalData[i][selectedXAxis.value], globalData[i][selectedYAxis.value],
                            //     globalData[i]["Region"], globalData[i]["Code"])
                            requiredDataset.push([globalData[i]["Country"], globalData[i][selectedXAxis.value], globalData[i][selectedYAxis.value],
                            globalData[i]["Region"], globalData[i]["Code"]])
                        }
                    }
                }

            }
            plotGraph(requiredDataset)
        }


        var boxPlotGraph = d3.select("#boxPlotSvg")
        var boxPlotDataSet = []
        if (selectedBoxAttribute.value == "None") {
            boxPlotGraph.selectAll("*").remove()
        } else {
            for (var i = 0; i < globalData.length; i++) {
                if (globalData[i]["Year"] == selectedYear.value) {
                    if (globalRegionSelected.includes("SelectAll")) {
                        boxPlotDataSet.push([globalData[i]["Country"], globalData[i][selectedBoxAttribute.value],
                        globalData[i]["Region"], globalData[i]["Code"]])
                    } else {
                        if (globalRegionSelected.includes(globalData[i]["Region"])) {
                            // console.log(globalData[i]["Country"], globalData[i][selectedXAxis.value], globalData[i][selectedYAxis.value],
                            //     globalData[i]["Region"], globalData[i]["Code"])
                            boxPlotDataSet.push([globalData[i]["Country"], globalData[i][selectedBoxAttribute.value],
                            globalData[i]["Region"], globalData[i]["Code"]])
                        }
                    }
                }

            }
            getBoxPlot(boxPlotDataSet)
        }


    })

}


function plotGraph(data, callBackFunc = function () { }) {

    var svg = d3.select("#beeswarmChartPlot")
    var selectedXAxis = document.getElementById("xAxisSelect")
    var selectedYAxis = document.getElementById("yAxisSelect")
    var selectedYear = document.getElementById("yearInputBox")


    var toolTipDiv = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)


    var g = svg.append("g")
        .attr('transform', `translate(${margin.left}, ${margin.top})`)


    var plotData = data.map(d => {
        return {
            country: d[0],
            xSelected: parseFloat(parseFloat(d[1]).toFixed(2)),
            ySelected: +d[2],
            regionSelected: d[3]
        }
    })

    if (document.getElementById("xAxis")) {
        setScale(plotData)
        updateAxis()

    } else {
        setScale(plotData)
        initAxis()
    }


    var bubbleSize = d3.scaleSqrt().domain(d3.extent(plotData.map((d) => d.ySelected))).range([4, 30])

    if (document.getElementById("xLabel")) {
        tr = d3.transition()
            .duration(1000)
        var x = document.getElementById("xLabel")

        x.innerHTML = selectedXAxis.value

    } else {
        g.
            append('text')
            .attr("class", "x label")
            .attr("id", "xLabel")
            .attr("text-anchor", "end")
            .attr('x', width / 2)
            .attr('y', chartHeight + 35)
            .text(selectedXAxis.value)
    }

    showRegionLegend()


    showRadiusLegend(plotData)


    var simulation = d3.forceSimulation(plotData)
        .force('charge', d3.forceManyBody().strength(4))
        .force('x', d3.forceX().x(function (d) {
            // return Math.max(minX, Math.min(maxX, xScale(d.xSelected)))
            return xScale(d.xSelected)
        }))
        .force('y', d3.forceY().y(function (d) {
            // return Math.max(minY, Math.min(maxY, chartHeight / 2))
            return chartHeight / 2
        }))
        .force('collision', d3.forceCollide().radius(function (d) {
            return bubbleSize(d.ySelected)
        }))

    var numIterations = 250
    for (let i = 0; i < numIterations; i++) {
        simulation.tick();
    }
    simulation.on("end", (d) => {
        let vis = d3.select("#beeswarmChartPlot")
        vis.selectAll("circle")
            .data(plotData, (d) => {
                return d.country
            })
            .join(
                enter => enter.append("circle")
                    .attr("cx", (d) => d.x)
                    .attr("cy", (d) => d.y)
                    .attr("r", 0)
                    .attr("stroke-width", "1px")
                    .attr("stroke", "black")
                    .attr("fill", (d) => colors(d.regionSelected))
                    .on('mouseover', function (d, i) {

                        var img = document.createElement("img");
                        img.src = "data/flags/" + i.country.replace(/ /g, "-") + ".png";
                        // img.src = "flags/India.png"
                        img.alt = i.country + " Flag";
                        img.width = 50;
                        img.height = 30;
                        toolTipDiv.node().appendChild(img)
                        console.log("------------>>>>>>", img)
                        toolTipDiv.transition()
                            .duration(0)
                            .style("display", "block")
                            .style("opacity", 0.8)
                        toolTipDiv.html(`<img src="data/flags/${i.country.replace(/ /g, "-")}.png" alt="${i.Country} Flag" width="50" height="30"> <br/>` + "For " + selectedYear.value + "<br/>" + "Country: " + i.country + "<br/>" + selectedXAxis.value + ": "
                            + i.xSelected + "<br/>" + selectedYAxis.value + ": " + i.ySelected)
                            .style("left", d.pageX + "px")
                            .style("top", d.pageY + 'px')
                            .style("position", "absolute")
                            .style("text-align", "left")



                    })
                    .on('mousemove', function (d, i) {
                        toolTipDiv.transition()
                            .duration(0)
                            .style("display", "block")
                            .style("opacity", 0.8)
                            .style("left", d.pageX + "px")
                            .style("top", d.pageY + 'px')
                            .style("position", "absolute")


                    })
                    .on('mouseout', function (d) {
                        toolTipDiv.transition()
                            .duration(300)
                            .style("display", "none")
                    })


                    .call(enter => enter.transition()
                        .delay(1300)
                        .duration(500)
                        .attr("r", (d) => bubbleSize(d.ySelected))),

                update => update
                    .call(update => update.transition()
                        .delay(function (d, i) {
                            if (i < 5) {
                                return 100
                            } else if (i >= 5 && i < 30) {
                                return 300
                            } else if (i >= 30 && i < 80) {
                                return 550
                            } else {
                                return 700
                            }
                        })
                        .duration(1000)
                        .attr("cx", (d) => d.x)
                        .attr("cy", (d) => d.y)
                        .attr("r", (d) => bubbleSize(d.ySelected))),

                exit => exit
                    .call(exit => exit.transition()
                        .duration(200)
                        .attr("r", 0)
                        .remove())

            )

        callBackFunc()
    }
    )

}



function showRegionLegend() {

    var yAxisLegend = d3.select("#svgLegend")
        .style("margin-top", "2px");


    var lst = []
    if (globalRegionSelected.includes("SelectAll")) {
        lst = allWorldRegions
    } else {
        lst = globalRegionSelected
    }


    yLegend = yAxisLegend.selectAll(".legend-item")
        .data(lst)
        .enter()
        .append('div')
        .attr("class", "legend-item")
        .style("display", "inline-block")

    yLegend.append("div")
        .style("width", "10px")
        .style("height", "10px")
        .style("background-color", d => colors(d))
        .style("display", "inline-block")
        .style("margin-left", "10px")

    yLegend.append("span")
        .text(d => d)
        .style("display", "inline-block")
        .style("margin-left", "5px")

}


function showRadiusLegend(data) {
    var yAxisLegend = d3.select("#yAxisLegend")
        .style("margin-top", "2px");
    yAxisLegend.selectAll("*").remove()

    var dict = {}
    var lst = []
    if (globalRegionSelected.includes("SelectAll")) {
        lst = allWorldRegions
    } else {
        lst = globalRegionSelected
    }

    for (val of lst) {
        var filteredData = data.filter(function (d) { return d.regionSelected == val })
        dict[val] = filteredData.map(function (d) {
            return d.ySelected
        })
    }
    var result = {}
    for (var key in dict) {
        var values = dict[key]
        var min = d3.min(values)
        var max = d3.max(values)

        result[key] = [min, max]
    }
    console.log(result)

    yLegend = yAxisLegend.selectAll(".legend-item")
        .data(Object.entries(result))
        .enter()
        .append('div')
        .attr("class", "legend-item")
        .style("display", "inline-block")

    yLegend.append("div")
        .style("width", "10px")
        .style("height", "10px")
        .style("background-color", d => {
            return colors(d[0])
        })
        .style("display", "inline-block")
        .style("margin-left", "10px")

    yLegend.append("span")
        .text(d => "minSize : " + parseFloat(parseFloat(d[1][0]).toFixed(2)) + " maxSize : " + parseFloat(parseFloat(d[1][1]).toFixed(2)))
        .style("display", "inline-block")
        .style("margin-left", "5px")

}


// xaxis animation and d3 join
function updateAxis() {
    var trans = d3.transition()
        .duration(1000)

    d3.select("#xAxis")
        .transition(trans)
        .call(xAxisCall)

}

function initAxis() {

    var svg = d3.select("#beeswarmChartPlot")
    var g = svg.append("g")
        .attr('transform', `translate(${margin.left}, ${margin.top})`)


    g.append('g')
        .attr("id", "xAxis")
        .attr('transform', `translate(0,${chartHeight})`)
        .call(xAxisCall)

}

function setScale(plotData) {
    xScale.domain([Math.max(0, d3.min(plotData, d => d.xSelected) - 5), d3.max(plotData, d => d.xSelected)])
        .range([10, chartWidth])
    xAxisCall.scale(xScale)


}

var isPlaying = true
function getPlayButton() {

    var div = document.createElement("div")
    div.id = "playButtonDiv"
    var but = document.createElement("input")
    but.type = "button"
    but.id = "playButton"
    but.value = "Play"


    but.onclick = function () {
        var currentValue = but.value
        var updatedLabel = currentValue == "Play" ? "Stop" : "Play"
        but.value = updatedLabel
        var yearBox = document.getElementById("yearInputBox")
        yearBox.value = 1980
        startPlayTransition()
    }
    div.appendChild(but)
    return div
}


function startPlayTransition() {
    var dataset = []
    var svg = d3.select("#beeswarmChartPlot")
    var selectedXAxis = document.getElementById("xAxisSelect")
    var selectedYAxis = document.getElementById("yAxisSelect")
    var button = document.getElementById("playButton")
    console.log(button.value)


    if (button.value == "Stop") {
        if (parseInt(document.getElementById("yearInputBox").value) < 2013) {
            var yearBox = document.getElementById("yearInputBox")
            yearBox.value = +yearBox.value + 1
            dataset = []
            for (var i = 0; i < globalData.length; i++) {
                if (globalData[i]["Year"] == yearBox.value) {
                    if (globalRegionSelected.includes("SelectAll")) {
                        dataset.push([globalData[i]["Country"], globalData[i][selectedXAxis.value], globalData[i][selectedYAxis.value],
                        globalData[i]["Region"], globalData[i]["Code"]])
                    } else {
                        if (globalRegionSelected.includes(globalData[i]["Region"])) {
                            // console.log(globalData[i]["Country"], globalData[i][selectedXAxis.value], globalData[i][selectedYAxis.value],
                            //     globalData[i]["Region"], globalData[i]["Code"])
                            dataset.push([globalData[i]["Country"], globalData[i][selectedXAxis.value], globalData[i][selectedYAxis.value],
                            globalData[i]["Region"], globalData[i]["Code"]])
                        }
                    }
                }

            }
            // console.log("plot graph called....")
            plotGraph(dataset, callBackFunc = startPlayTransition)
            // console.log(dataset)


        } else {
            button.value = "Play"
            var yearBox = document.getElementById("yearInputBox")
            yearBox.value = "1980"
            dataset = []
            for (var i = 0; i < globalData.length; i++) {
                if (globalData[i]["Year"] == yearBox.value) {
                    if (globalRegionSelected.includes("SelectAll")) {
                        dataset.push([globalData[i]["Country"], globalData[i][selectedXAxis.value], globalData[i][selectedYAxis.value],
                        globalData[i]["Region"], globalData[i]["Code"]])
                    } else {
                        if (globalRegionSelected.includes(globalData[i]["Region"])) {
                            // console.log(globalData[i]["Country"], globalData[i][selectedXAxis.value], globalData[i][selectedYAxis.value],
                            //     globalData[i]["Region"], globalData[i]["Code"])
                            dataset.push([globalData[i]["Country"], globalData[i][selectedXAxis.value], globalData[i][selectedYAxis.value],
                            globalData[i]["Region"], globalData[i]["Code"]])
                        }
                    }
                }

            }
            plotGraph(dataset)
        }
    } else {
        var yearBox = document.getElementById("yearInputBox")
        dataset = []
        for (var i = 0; i < globalData.length; i++) {
            if (globalData[i]["Year"] == yearBox.value) {
                if (globalRegionSelected.includes("SelectAll")) {
                    dataset.push([globalData[i]["Country"], globalData[i][selectedXAxis.value], globalData[i][selectedYAxis.value],
                    globalData[i]["Region"], globalData[i]["Code"]])
                } else {
                    if (globalRegionSelected.includes(globalData[i]["Region"])) {
                        // console.log(globalData[i]["Country"], globalData[i][selectedXAxis.value], globalData[i][selectedYAxis.value],
                        //     globalData[i]["Region"], globalData[i]["Code"])
                        dataset.push([globalData[i]["Country"], globalData[i][selectedXAxis.value], globalData[i][selectedYAxis.value],
                        globalData[i]["Region"], globalData[i]["Code"]])
                    }
                }
            }

        }
        plotGraph(dataset)
    }
}
function getLabelForDropdown(divId, innerText, labelFor) {
    var div = document.createElement("div")
    div.id = divId
    var label = document.createElement("label")
    label.innerHTML = innerText
    label.htmlFor = labelFor

    div.appendChild(label)
    return div
}

function createYearInput(name, id, type) {
    var inputElement = document.createElement("input")
    inputElement.name = name
    inputElement.id = id
    inputElement.type = type
    inputElement.defaultValue = 1980
    inputElement.max = 2013
    inputElement.min = 1980
    return inputElement
}

function createDropdown(name, id, optionList) {
    var selectElement = document.createElement("select")
    selectElement.name = name
    selectElement.id = id
    selectElement.style.width = "50%"
    var option = document.createElement("option")
    option.value = "None"
    option.text = "Select Attribute"
    option.defaultSelected = true
    option.defaultValue =
        selectElement.appendChild(option)


    for (var val of optionList) {
        var option = document.createElement("option")
        option.value = val
        option.text = val
        selectElement.appendChild(option)
    }

    return selectElement
}

function getYears(start, end) {
    var years = []
    for (i = start; i <= end; i++) {
        years.push(i)
    }

    return years
}

var allSelected = false;
function selectDeselectAll() {
    // var option = document.getElementById("selectAllOption")
    var option = document.getElementsByClassName("checkBoxOption")
    if (allSelected) {
        allSelected = false;
        for (var i = 0; i < option.length; i++) {
            if (option[i].type = "checkbox") {
                option[i].checked = false;
            }
        }
    } else {
        allSelected = true;
        for (var i = 0; i < option.length; i++) {
            if (option[i].type = "checkbox") {
                option[i].checked = true;
            }
        }
    }
}

function getBoxPlot(data) {
    var svg = d3.select("#boxPlotSvg")
    svg.selectAll("*").remove()
    var g = svg.append("g")
        .attr('transform', `translate(${margin.left}, ${margin.top})`)
    var dict = {}


    var plotData = data.map(d => {
        return {
            country: d[0],
            attrValue: parseFloat(parseFloat(d[1]).toFixed(2)),
            region: d[2],
            code: d[3]
        }
    })

    var lst = []
    if (globalRegionSelected.includes("SelectAll")) {
        lst = allWorldRegions
    } else {
        lst = globalRegionSelected
    }


    for (reg of lst) {
        var attrData = plotData.filter(function (d) { return d.region == reg }).map(function (d) {
            return d.attrValue
        })
        var q1 = d3.quantile(attrData.sort(d3.ascending), 0.25)
        var q3 = d3.quantile(attrData.sort(d3.ascending), 0.75)
        dict[reg] = {
            q1: q1,
            median: d3.quantile(attrData.sort(d3.ascending), 0.50),
            q3: q3,
            inter: q3 - q1,
            min: q1 - 1.5 * (q3 - q1),
            max: q3 + 1.5 * (q3 - q1)

        }
    }

    var xScale = d3.scaleBand()
        .range([0, chartWidth])
        .domain(lst)
        .paddingInner(1)
        .paddingOuter(.5)


    g.append("g")
        .attr("transform", "translate(0," + chartHeight + ")")
        .call(d3.axisBottom(xScale))


    let overallMin = Number.POSITIVE_INFINITY
    let overallMax = Number.NEGATIVE_INFINITY

    for (reg of lst) {
        if (dict[reg].min < overallMin) {
            overallMin = dict[reg].min
        }
        if (dict[reg].max > overallMax) {
            overallMax = dict[reg].max
        }
    }
    var yScale = d3.scaleLinear()
        .domain([overallMin - 2, overallMax + 2])
        .range([chartHeight, 0])
    g.append("g").call(d3.axisLeft(yScale))

    g.selectAll("verticalLine")
        .data(Object.entries(dict))
        .enter()
        .append("line")
        .attr("x1", function (d) {
            return xScale(d[0])
        })
        .attr("x2", function (d) {
            return xScale(d[0])
        })
        .attr("y1", function (d) {
            return yScale(d[1].min)
        })
        .attr("y2", function (d) {
            return yScale(d[1].max)
        })
        .attr("stroke", "black")
        .style("width", 40)

    var boxWidth = 100
    g
        .selectAll("boxes")
        .data(Object.entries(dict))
        .enter()
        .append("rect")
        .attr("x", function (d) { return (xScale(d[0]) - boxWidth / 2) })
        .attr("y", function (d) { return (yScale(d[1].q3)) })
        .attr("height", function (d) { return (yScale(d[1].q1) - yScale(d[1].q3)) })
        .attr("width", boxWidth)
        .attr("stroke", "black")
        .style("fill", (d) => colors(d[0]))


    g
        .selectAll("medianLines")
        .data(Object.entries(dict))
        .enter()
        .append("line")
        .attr("x1", function (d) { return (xScale(d[0]) - boxWidth / 2) })
        .attr("x2", function (d) { return (xScale(d[0]) + boxWidth / 2) })
        .attr("y1", function (d) { return (yScale(d[1].median)) })
        .attr("y2", function (d) { return (yScale(d[1].median)) })
        .attr("stroke", "black")
        .style("width", 80)

    console.log("---------->", Object.entries(dict))
}