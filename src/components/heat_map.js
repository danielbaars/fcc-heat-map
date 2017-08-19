import React, { Component } from 'react';
import { scaleLinear, scaleTime } from 'd3-scale';
import { min, max } from 'd3-array';
import { select } from 'd3-selection';
import { axisBottom, axisLeft } from 'd3-axis';
import { transition } from 'd3-transition';

function round(value, decimals) {
  return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
}

export default class HeatMap extends Component {
  constructor(props){
    super(props);
    this.createHeatMap = this.createHeatMap.bind(this);
  }
  componentDidMount() {
    this.createHeatMap()
  }
  componentDidUpdate() {
    this.createHeatMap()
  }
  createHeatMap() {

    const node = this.node;
    const base = this.props.baseTemp;
    const data = this.props.data;

    let m = { top: 0, right: 0, bottom: 75, left: 54 };

    const w = this.props.size[0] - m.left - m.right;
    const h = this.props.size[1] - m.top - m.bottom;

    const cellWidth = w / Math.round(data.length / 12);
    const cellHeight = h / 12;

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const monthNamesShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
    const numbers = [0, 2.7, 3.9, 5, 6.1, 7.2, 8.3, 9.4, 10.5, 11.6, 12.7];
    const colors = ['#5E4FA2', '#3288BD', '#66C2A5', '#ABDDA4', '#E6F598', '#FFFFBF', '#FEE08B', '#FDAE61', '#F46D43', '#D53E4F', '#9E0142'];

    const temps = data.map(d => base + d.variance);
    const years = [...new Set( data.map(d => d.year) )];

    const colorScale = scaleLinear()
      .domain(numbers)
      .range(colors);

    const cells = select(node)
      .append('g')
      .attr('class', 'cells')
      .attr('transform', `translate(${m.left}, ${m.top})`)
      .selectAll('rect')
        .data(data)
        .enter()
          .append('rect')
          .attr('width', cellWidth)
          .attr('height', cellHeight)
          .attr('x', (d,i) => Math.floor(i / 12) * cellWidth)
          .attr('y', (d,i) => (i % 12) * cellHeight)
          .attr('fill', d => colorScale(base + d.variance))
          .on('mouseover', d => {
            const warmer = d.variance > 0;
            tooltip.transition().duration(200)
              .style('opacity', 0.9);
            tooltip.html(`
                          <div class='ttip__date'><span class='ttip__year'>${d.year}</span> (${monthNames[d.month - 1]})</div>
                          <div class='ttip__temperature'>Temperature: <strong>${round(d.variance + base, 1)}&deg;</strong></div>
                          <div class='ttip__variance'>Variance: <strong class='${warmer ? 'warmer' : 'colder'}'>${round(d.variance, 1)}&deg;</strong></div>
                        `)
              .style('left', (event.pageX + 8 + 'px'))
              .style('top', (event.pageY - 90 + 'px'))
          })
          .on('mouseout', d => {
            tooltip.transition().duration(200)
              .style('opacity', 0);
          });


    const colorInfoChart = () => {

      const size = 30;

      const colorInfo = select(node)
        .append('g')
        .attr('class', 'color_info')
        .attr('transform', `translate(${w + m.left + m.right - 330}, ${h + m.top + m.bottom - size - 14})`);

      colorInfo.selectAll('rect')
        .data(colors)
        .enter()
          .append('rect')
          .attr('width', size)
          .attr('height', size)
          .attr('x', (d, i) => i * size)
          .style('fill', d => d);

      colorInfo.selectAll('text')
        .data(numbers)
        .enter()
          .append('text')
          .attr('font-size', '10')
          .attr('text-anchor', 'middle')
          .attr('alignment-baseline', 'hanging')
          .attr('width', size)
          .attr('height', size)
          .attr('x', (d, i) => (i * size) + (size / 2))
          .attr('y', size + 5)
          .text(d => d);

    }


    colorInfoChart();


    const xScale = scaleLinear()
      .domain([min(years), max(years)])
      .range([w, 0]);

    const xAxisValues = scaleLinear()
      .domain([min(years), max(years)])
      .range([0, w]);

    const xAxisTicks = axisBottom(xAxisValues)
      .ticks((years.length / 10), 'd');

    const xGuide = select(node)
      .append('g')
      .attr('id', 'xguide')
      .attr('transform', `translate(${m.left}, ${h + m.top})`)
      .call(xAxisTicks);

    const xGuideLabel = select(node)
      .append('text')
      .text('Years')
      .attr('x', w / 2)
      .attr('y', h + m.top + m.bottom - 1 - 45)
      .attr('text-anchor', 'middle')
      .attr('alignment-baseline', 'hanging')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .style('text-transform', 'uppercase');

    const yAxisValues = scaleLinear()
      .domain([.5, 12.5])
      .range([0, h]);

    const yAxisTicks = axisLeft(yAxisValues)
      .ticks(12)
      .tickFormat(d => monthNamesShort[d - 1]);

    const yGuide = select(node)
      .append('g')
      .attr('id', 'yguide')
      .attr('transform', `translate(${m.left}, ${m.top})`)
      .call(yAxisTicks)
      .selectAll('.tick')
      .style('text-transform', 'uppercase');

    const yGuideLabel = select(node)
      .append('text')
      .text('Months')
      .attr('transform', 'rotate(-90)')
      .attr('x', -(h / 2))
      .attr('y', 12)
      .style('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .style('text-transform', 'uppercase');

    const tooltip = select('body').append('div')
      .attr('class', 'ttip')
      .style('opacity', 0);

    const styles = select(node)
      .append('style')
      .text('\
        .ttip { \
          position: absolute; \
          border-radius: 6px; \
          background-color: gainsboro; \
          color: black; \
          padding: 7px 11px; \
          font-size: 14px; \
        } \
        .ttip__date { \
          font-size: 16px; \
        } \
        .ttip__year { \
          font-weight: bold; \
        } \
        .ttip__variance { \
          font-size: 12px; \
        } \
        .warmer { \
          color: red; \
        } \
        .colder { \
          color: blue; \
        } \
        .chart_info__text { \
          transform: translate(10px, 4px); \
          font-size: 12px; \
          font-weight: normal; \
        } \
      ');

  }
  render() {
    return (
      <div className="visual">
        <svg ref={node => this.node = node} width={this.props.size[0]} height={this.props.size[1]} />
      </div>
    );
   }
}
