import { Init, d3Remove, makecomma, d3, svgCheck} from '@saramin/ui-d3-helper';
import CLASS from '@saramin/ui-d3-selector';

const StackedBarChart = function(...arg) {
	const plugin = new Init(arg);
	let targetNodes = this.targetNodes = Init.setTarget(plugin),
		dataContainer = this.dataContainer = Init.setData(plugin),
		options = this.options = Init.setOptions(plugin, {
			w: 920,
			h: 500,
			mTop: 40,
			mRight: 20,
			mBottom: 20,
			mLeft: 40,
			ticks: 7,
			wrapClass: `${CLASS.stackedBar}`,
			toolTip: '',
			toolTipX: '60',
			toolTipY: '10',
		}),
		instances = this.instances = [];

	Array.from(targetNodes).forEach(exec);

	function exec(el, i) {
		if(svgCheck.status) {
			// data reformat
			const data = dataContainer[i];
			const key = dataContainer[1];
			let reformatData = d3.stack().keys(key)(data);
			d3Remove(el);

			const width = options.w - (options.mRight + options.mLeft),
				height = options.h - (options.mTop + options.mBottom);

			// svg 생성
			const g = d3.select(el).append('svg')
				.classed(`${CLASS.stackedBar}`, true)
				.attr('width', width + options.mLeft + options.mLeft)
				.attr('height', height + options.mTop + options.mBottom )
				.append('g')
				.attr('transform', 'translate(' + options.mLeft + ',' + options.mTop + ')');

			// set the ranges
			const x = d3.scaleLinear().rangeRound([0, width]),
				y = d3.scaleBand().rangeRound([0, height]).padding(0.5),
				xAxis = d3.axisBottom(x),
				yAxis = d3.axisLeft(y);

			y.domain(data.map(function(d) { return d.lable; }));
			x.domain([0, d3.max(reformatData[reformatData.length - 1], d => Math.max(d[0], d[1]))]).nice();


			const bar = g.selectAll(`.${CLASS.stackedClass}`)
				.data(reformatData)
				.enter()
				.append('g')
				.attr('class', (d, i) => `${CLASS.stackedClass} ${CLASS.stackedClass}_`+ (i+1))
				.selectAll('rect')
				.data(d => d)
				.enter()
				.append('rect')
				.classed(`${CLASS.stackedBarClass}`, true)
				.attr('x', d => x(d[0]))
				.attr('y', d => y(d.data.lable))
				.attr('width', d => x(d[1]) - x(d[0]))
				.attr('height', y.bandwidth());


			const tooltip = d3.select(el)
				.append('div')
				.classed(`${options.wrapClass}_${CLASS.tooltipClass}`, true)
				.style('opacity', '0');

			bar.on('mouseover', d => {
				tooltip.style('opacity','1');
			});
			bar.on('mouseout', _ => tooltip.style('opacity','0'));
			bar.on('mousemove', function(d) {
				let xPosition = d3.mouse(this)[0] + options.toolTipX,
					yPosition = d3.mouse(this)[1] - options.toolTipY;
				tooltip._groups[0][0].style.WebkitTransform  = 'translate(' + xPosition + 'px, ' + yPosition + 'px)';
				tooltip._groups[0][0].style.msTransform  = 'translate(' + xPosition + 'px, ' + yPosition + 'px)';
				tooltip._groups[0][0].style.transform  = 'translate(' + xPosition + 'px, ' + yPosition + 'px)';
				tooltip.html(makecomma(d.data[d3.select(this.parentNode).datum().key]));
			});

			g.append('g')
				.classed(`${CLASS.xAxis}`, true)
				.attr('transform', 'translate(0,' + height + ')')
				.call(xAxis);

			g.append('g')
				.classed(`${CLASS.yAxis}`, true)
				.attr('transform', 'translate(0,0)')
				.call(yAxis);
		} else {
			el.innerHTML = '<p class="svg_not_supported">SVG를 지원하지 않는 브라우저입니다.</p>'
		}


	}
};
export default StackedBarChart;
