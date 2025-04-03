document.addEventListener("DOMContentLoaded", function () {
    d3.csv(csvDataUrl).then(data => {
        if (!data || data.length === 0) {
            console.error("Dữ liệu chưa được load hoặc rỗng!");
            return;
        }

        console.log("Dữ liệu đã load:", data);

        const margin = { top: 40, right: 40, bottom: 50, left: 200 },
            width = 900,
            height = 500;

        // Phân loại khách hàng theo Mã PKKH
        data.forEach(d => {
            d["Thành tiền"] = isNaN(+d["Thành tiền"]) ? 0 : +d["Thành tiền"];
            d["SL"] = isNaN(+d["SL"]) ? 0 : +d["SL"];
            
            const maPKKH = d["Mã PKKH"] || "";
            if (["A1", "A2", "A3"].includes(maPKKH)) {
                d["Loại KH"] = "Nhu cầu sức khỏe";
            } else if (["B1", "B2", "B3"].includes(maPKKH)) {
                d["Loại KH"] = "Bệnh nền";
            } else if (["C1", "C2", "C3"].includes(maPKKH)) {
                d["Loại KH"] = "Mục đích khác";
            }
        });

        // Tạo cột Nhóm hàng và giữ nguyên dữ liệu
        const data1 = data.map(d => ({
            "Mã đơn hàng": d["Mã đơn hàng"] || "",
            "Nhóm hàng": `[${d["Mã nhóm hàng"] || "Unknown"}] ${d["Tên nhóm hàng"] || "Không tên"}`,
            "Thành tiền": d["Thành tiền"],
            "SL": d["SL"],
            "Loại KH": d["Loại KH"]
        }));

        // Tổng hợp dữ liệu theo 3 nhóm phân khúc
        const aggregatedData = Array.from(
            d3.group(data1, d => d["Loại KH"]),
            ([key, values]) => ({
                "Loại KH": key,
                "Doanh thu": d3.sum(values, d => d["Thành tiền"]),
                "Số lượng": d3.sum(values, d => d["SL"]),
                "Số đơn hàng": [...new Set(values.map(d => d["Mã đơn hàng"]))].length
            })
        ).filter(d => d["Loại KH"]); // Loại bỏ các giá trị undefined

        if (aggregatedData.length === 0) {
            console.error("Không có dữ liệu sau khi tổng hợp!");
            d3.select("#chartQ6").append("p").text("Không có dữ liệu để hiển thị.");
            return;
        }

        // Sắp xếp theo doanh thu giảm dần
        aggregatedData.sort((a, b) => b["Doanh thu"] - a["Doanh thu"]);

        // Khởi tạo SVG
        const svg = d3.select("#chartQ6")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom);

        const chart = svg.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Thang đo
        const x = d3.scaleLinear()
            .domain([0, d3.max(aggregatedData, d => d["Doanh thu"]) || 1000000])
            .nice()
            .range([0, width]);

        const y = d3.scaleBand()
            .domain(aggregatedData.map(d => d["Loại KH"]))
            .range([0, height])
            .padding(0.2);

        const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

        // Vẽ các cột
        chart.selectAll(".bar")
            .data(aggregatedData)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", 0)
            .attr("y", d => y(d["Loại KH"]))
            .attr("width", d => x(d["Doanh thu"]))
            .attr("height", y.bandwidth())
            .attr("fill", d => colorScale(d["Loại KH"]));

        // Nhãn doanh thu trên cột
        chart.selectAll(".label")
            .data(aggregatedData)
            .enter()
            .append("text")
            .attr("class", "label")
            .attr("x", d => x(d["Doanh thu"]) + 5)
            .attr("y", d => y(d["Loại KH"]) + y.bandwidth() / 2)
            .attr("dy", "0.35em")
            .text(d => `${Math.round(d["Doanh thu"]).toLocaleString()} VNĐ`)
            .style("font-size", "10px");

        // Thêm trục X
        chart.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x).tickFormat(d => `${Math.round(d/1000000)}M`).ticks(6))
            .style("font-size", "11px");

        // Thêm trục Y
        chart.append("g")
            .call(d3.axisLeft(y))
            .style("font-size", "11px");

        // Thêm tiêu đề biểu đồ
        svg.append("text")
            .attr("x", (width + margin.left + margin.right) / 2)
            .attr("y", margin.top / 2)
            .attr("text-anchor", "middle")
            .attr("font-size", "18px")
            .attr("fill", "#337ab7")
            .text("Doanh số bán hàng theo Nhu cầu của Khách hàng");

    }).catch(error => {
        console.error("Lỗi tải dữ liệu:", error);
        d3.select("#chartQ6").append("p").text("Có lỗi xảy ra khi tải dữ liệu.");
    });
});