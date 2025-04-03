document.addEventListener("DOMContentLoaded", function () {
    // Đọc dữ liệu từ file CSV
    d3.csv(csvDataUrl).then(data => {
        // Kiểm tra dữ liệu đầu vào
        console.log("Dữ liệu gốc:", data);
        console.log("Cột có trong dữ liệu:", Object.keys(data[0]));

        // Chuyển đổi dữ liệu
        data.forEach(d => {
            d["Thành tiền"] = +d["Thành tiền"] || 0; // Chuyển thành số
            d["Thời gian tạo đơn"] = d3.timeParse("%Y-%m-%d %H:%M:%S")(d["Thời gian tạo đơn"]) || new Date(); // Xử lý ngày
        });

        // Tổng hợp doanh thu theo mặt hàng và nhóm hàng
        const revenueByProduct = d3.rollups(
            data,
            v => ({
                value: d3.sum(v, d => d["Thành tiền"]),
                group: v[0]["Tên nhóm hàng"] || "Không xác định"
            }),
            d => `[${d["Mã mặt hàng"]}] ${d["Tên mặt hàng"]}`
        ).map(([name, obj]) => ({ name, value: obj.value, group: obj.group }));

        const revenueByGroup = d3.rollups(
            data,
            v => d3.sum(v, d => d["Thành tiền"]),
            d => `[${d["Mã nhóm hàng"]}] ${d["Tên nhóm hàng"]}`
        ).map(([group, value]) => ({ group, value }));

        // Sắp xếp dữ liệu
        revenueByProduct.sort((a, b) => b.value - a.value);
        revenueByGroup.sort((a, b) => b.value - a.value);

        // Tạo màu cho nhóm hàng
        const colorScale = d3.scaleOrdinal(d3.schemeCategory10)
            .domain([...new Set(revenueByProduct.map(d => d.group))]);

        // Kích thước SVG
        const width = 1200;
        const height = 700;
        const margin = { top: 40, right: 250, bottom: 50, left: 220 };

        // Tạo SVG
        const svg = d3.select("#chartQ1")
            .append("svg")
            .attr("width", width)
            .attr("height", height);

        // Tạo trục X và Y
        const x = d3.scaleLinear()
            .domain([0, d3.max(revenueByProduct, d => d.value)])
            .nice()
            .range([margin.left, width - margin.right]);

        const y = d3.scaleBand()
            .domain(revenueByProduct.map(d => d.name))
            .range([margin.top, height - margin.bottom])
            .padding(0.2);

        // Thêm trục
        svg.append("g")
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(x).ticks(5).tickFormat(d => `${d / 1e6}M`));

        svg.append("g")
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(y));

        // Vẽ thanh biểu đồ
        svg.selectAll(".bar")
            .data(revenueByProduct)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", margin.left)
            .attr("y", d => y(d.name))
            .attr("width", d => x(d.value) - margin.left)
            .attr("height", y.bandwidth())
            .attr("fill", d => colorScale(d.group));

        // Thêm nhãn giá trị
        svg.selectAll(".label")
            .data(revenueByProduct)
            .enter()
            .append("text")
            .attr("x", d => x(d.value) + 10)
            .attr("y", d => y(d.name) + y.bandwidth() / 2)
            .attr("dy", "0.35em")
            .attr("font-size", "14px")
            .attr("fill", d => d3.color(colorScale(d.group)).darker(2))
            .text(d => `${Math.round(d.value / 1e6)} triệu VND`);

        // Thêm tiêu đề (giống code Q3)
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", margin.top / 2)
            .attr("text-anchor", "middle")
            .attr("font-size", "18px")
            .attr("fill", "#337ab7") // Thay đổi màu từ #009688 thành #337ab7
            .text("Doanh số bán hàng theo Mặt hàng");

    }).catch(error => {
        console.error("Lỗi tải dữ liệu:", error);
        alert("Không thể tải dữ liệu từ file CSV. Vui lòng kiểm tra file data_ggsheet.csv.");
    });
});