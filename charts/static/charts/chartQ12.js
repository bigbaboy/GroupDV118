d3.csv(csvDataUrl).then(data => {
    // Kiểm tra dữ liệu đầu vào
    console.log("Dữ liệu gốc:", data);
    console.log("Cột có trong dữ liệu:", Object.keys(data[0]));

    // Chuyển đổi dữ liệu từ chuỗi sang số và xử lý ngày
    data.forEach(d => {
        d["Thành tiền"] = +d["Thành tiền"] || 0; // Chuyển thành số, mặc định 0 nếu không hợp lệ
        d["Thời gian tạo đơn"] = d3.timeParse("%Y-%m-%d %H:%M:%S")(d["Thời gian tạo đơn"]); // Chuyển sang định dạng Date
        if (!d["Thời gian tạo đơn"]) {
            console.warn("Dữ liệu 'Thời gian tạo đơn' không hợp lệ cho dòng:", d);
            d["Thời gian tạo đơn"] = new Date(); // Gán giá trị mặc định nếu không hợp lệ
        }
        d["Mã PKKH"] = d["Mã PKKH"] || "Không xác định"; // Xử lý giá trị undefined
    });

    // Lọc dữ liệu chỉ lấy các dòng có Mã PKKH là "B2"
    const filteredData = data.filter(d => d["Mã PKKH"] === "B2");

    if (filteredData.length === 0) {
        console.error("Không có dữ liệu nào với Mã PKKH = B2");
        d3.select("#chartQ12").append("p").text("Không có dữ liệu để hiển thị cho Mã PKKH = B2");
        return;
    }

    // Tổng hợp doanh thu theo nhóm hàng (cho biểu đồ 2)
    const revenueByGroup = d3.rollups(
        filteredData,
        v => d3.sum(v, d => d["Thành tiền"]),
        d => `[${d["Mã nhóm hàng"]}] ${d["Tên nhóm hàng"]}`
    ).map(([group, value]) => ({ group, value }));

    // Sắp xếp dữ liệu theo doanh số giảm dần
    revenueByGroup.sort((a, b) => b.value - a.value);

    // Danh sách màu cho từng nhóm hàng
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10)
        .domain([...new Set(revenueByGroup.map(d => d.group))]);

    // Kích thước SVG
    const width = 1200;
    const height = 700;
    const margin = { top: 40, right: 250, bottom: 50, left: 220 };

    // Biểu đồ 2: Doanh số bán hàng theo Nhóm hàng
    const svg2 = d3.select("#chartQ12")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    const x2 = d3.scaleLinear()
        .domain([0, d3.max(revenueByGroup, d => d.value)])
        .nice()
        .range([margin.left, width - margin.right]);

    const y2 = d3.scaleBand()
        .domain(revenueByGroup.map(d => d.group))
        .range([margin.top, height - margin.bottom])
        .padding(0.2);

    svg2.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x2).ticks(5).tickFormat(d => `${d / 1e6}M`));

    svg2.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y2));

    svg2.selectAll(".bar")
        .data(revenueByGroup)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", margin.left)
        .attr("y", d => y2(d.group))
        .attr("width", d => x2(d.value) - margin.left)
        .attr("height", y2.bandwidth())
        .attr("fill", d => colorScale(d.group));

    svg2.selectAll(".label")
        .data(revenueByGroup)
        .enter()
        .append("text")
        .attr("x", d => x2(d.value) + 10)
        .attr("y", d => y2(d.group) + y2.bandwidth() / 2)
        .attr("dy", "0.35em")
        .attr("font-size", "14px")
        .attr("fill", "black")
        .text(d => `${Math.round(d.value / 1e6)} triệu VND`);

    svg2.append("text")
        .attr("x", width / 2)
        .attr("y", margin.top / 2)
        .attr("text-anchor", "middle")
        .attr("font-size", "18px")
        .attr("fill", "#337ab7")
        .text("Doanh số bán hàng theo Nhóm hàng của PKKH B2");

}).catch(error => console.error("Lỗi tải dữ liệu:", error));